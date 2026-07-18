package com.civic.complaintsystem.controller;

import com.civic.complaintsystem.dto.ComplaintDtos.*;
import com.civic.complaintsystem.entity.Department;
import com.civic.complaintsystem.repository.DepartmentRepository;
import com.civic.complaintsystem.service.AdminService;
import com.civic.complaintsystem.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ComplaintService complaintService;
    private final DepartmentRepository departmentRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/complaints")
    public ResponseEntity<Page<ComplaintResponse>> allComplaints(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<ComplaintResponse> result = complaintService.getAllComplaints(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(result);
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ComplaintResponse> updateStatus(
            Authentication auth, @PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(complaintService.updateStatus(id, request, auth.getName()));
    }

    @PutMapping("/complaints/{id}/assign")
    public ResponseEntity<ComplaintResponse> assignDepartment(
            Authentication auth, @PathVariable Long id, @Valid @RequestBody AssignDepartmentRequest request) {
        return ResponseEntity.ok(complaintService.assignDepartment(id, request.getDepartmentId(), auth.getName()));
    }

    @DeleteMapping("/complaints/{id}")
    public ResponseEntity<Void> deleteComplaint(@PathVariable Long id) {
        complaintService.softDelete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> departments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }
}
