package com.civic.complaintsystem.service;

import com.civic.complaintsystem.ai.OllamaService;
import com.civic.complaintsystem.dto.ComplaintDtos.*;
import com.civic.complaintsystem.entity.*;
import com.civic.complaintsystem.exception.ApiException;
import com.civic.complaintsystem.exception.ResourceNotFoundException;
import com.civic.complaintsystem.mapper.ComplaintMapper;
import com.civic.complaintsystem.repository.ComplaintHistoryRepository;
import com.civic.complaintsystem.repository.ComplaintRepository;
import com.civic.complaintsystem.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final DepartmentRepository departmentRepository;
    private final ComplaintHistoryRepository historyRepository;
    private final ComplaintMapper complaintMapper;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;
    private final OllamaService ollamaService;

    @Transactional
    public ComplaintResponse raiseComplaint(User user, ComplaintRequest request, MultipartFile image) {

        // AI Feature: spam detection before saving
        if (ollamaService.isLikelySpam(request.getTitle(), request.getDescription())) {
            throw new ApiException("This complaint looks like spam or is unrelated to civic issues. Please provide valid details.");
        }

        // AI Feature 1: rewrite/improve description
        String improvedDescription = ollamaService.rewriteComplaint(request.getDescription());

        // AI Feature 3: priority auto-suggestion if user did not choose one
        Priority priority = request.getPriority() != null
                ? request.getPriority()
                : ollamaService.predictPriority(request.getDescription());

        // category comes from user, but if AI disagrees strongly we still trust user's explicit choice
        ComplaintCategory category = request.getCategory();

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = fileStorageService.store(image);
        }

        Complaint complaint = Complaint.builder()
                .title(request.getTitle())
                .description(improvedDescription)
                .category(category)
                .priority(priority)
                .status(ComplaintStatus.PENDING)
                .location(request.getLocation())
                .imageUrl(imageUrl)
                .user(user)
                .deleted(false)
                .build();

        complaint = complaintRepository.save(complaint);
        complaint.setComplaintNumber(String.format("CMP%06d", complaint.getId()));
        complaint = complaintRepository.save(complaint);

        recordHistory(complaint, null, ComplaintStatus.PENDING, user.getEmail());

        return complaintMapper.toResponse(complaint);
    }

    /** AI Feature 2: standalone category prediction endpoint (used by frontend live-suggestion) */
    public ComplaintCategory suggestCategory(String text) {
        return ollamaService.predictCategory(text);
    }

    public Priority suggestPriority(String text) {
        return ollamaService.predictPriority(text);
    }

    public String rewriteText(String text) {
        return ollamaService.rewriteComplaint(text);
    }

    public Page<ComplaintResponse> getComplaintsForUser(User user, Pageable pageable) {
        return complaintRepository.findByUserAndDeletedFalse(user, pageable)
                .map(complaintMapper::toResponse);
    }

    public Page<ComplaintResponse> getAllComplaints(Pageable pageable) {
        return complaintRepository.findByDeletedFalse(pageable)
                .map(complaintMapper::toResponse);
    }

    public ComplaintResponse getById(Long id) {
        return complaintMapper.toResponse(findActiveOrThrow(id));
    }

    @Transactional
    public ComplaintResponse updateStatus(Long id, StatusUpdateRequest request, String changedBy) {
        Complaint complaint = findActiveOrThrow(id);
        ComplaintStatus oldStatus = complaint.getStatus();

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            complaint.setAssignedDepartment(dept);
        }

        complaint.setStatus(request.getStatus());
        complaint = complaintRepository.save(complaint);

        recordHistory(complaint, oldStatus, request.getStatus(), changedBy);

        notificationService.notify(complaint.getUser(),
                "Your complaint " + complaint.getComplaintNumber() + " status changed to " + request.getStatus());

        return complaintMapper.toResponse(complaint);
    }

    @Transactional
    public ComplaintResponse assignDepartment(Long id, Long departmentId, String changedBy) {
        Complaint complaint = findActiveOrThrow(id);
        Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        complaint.setAssignedDepartment(dept);
        if (complaint.getStatus() == ComplaintStatus.PENDING) {
            ComplaintStatus old = complaint.getStatus();
            complaint.setStatus(ComplaintStatus.ASSIGNED);
            recordHistory(complaint, old, ComplaintStatus.ASSIGNED, changedBy);
            notificationService.notify(complaint.getUser(),
                    "Your complaint " + complaint.getComplaintNumber() + " has been assigned to " + dept.getDepartmentName());
        }
        complaint = complaintRepository.save(complaint);
        return complaintMapper.toResponse(complaint);
    }

    @Transactional
    public void softDelete(Long id) {
        Complaint complaint = findActiveOrThrow(id);
        complaint.setDeleted(true);
        complaintRepository.save(complaint);
    }

    /** Marks a complaint as resolved - called by the user ("Done" button) after work is completed,
     *  or by admin from the admin panel. */
    @Transactional
    public ComplaintResponse markResolved(Long id, String changedBy) {
        Complaint complaint = findActiveOrThrow(id);
        ComplaintStatus old = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.RESOLVED);
        complaint = complaintRepository.save(complaint);
        recordHistory(complaint, old, ComplaintStatus.RESOLVED, changedBy);
        notificationService.notify(complaint.getUser(),
                "Your complaint " + complaint.getComplaintNumber() + " has been marked as RESOLVED.");
        return complaintMapper.toResponse(complaint);
    }

    private void recordHistory(Complaint complaint, ComplaintStatus old, ComplaintStatus updated, String changedBy) {
        ComplaintHistory history = ComplaintHistory.builder()
                .complaint(complaint)
                .oldStatus(old)
                .newStatus(updated)
                .changedBy(changedBy)
                .build();
        historyRepository.save(history);
    }

    private Complaint findActiveOrThrow(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        if (complaint.isDeleted()) {
            throw new ResourceNotFoundException("Complaint not found");
        }
        return complaint;
    }
}
