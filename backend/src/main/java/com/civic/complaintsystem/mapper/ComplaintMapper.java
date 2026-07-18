package com.civic.complaintsystem.mapper;

import com.civic.complaintsystem.dto.ComplaintDtos.ComplaintResponse;
import com.civic.complaintsystem.entity.Complaint;
import org.springframework.stereotype.Component;

@Component
public class ComplaintMapper {

    public ComplaintResponse toResponse(Complaint c) {
        return ComplaintResponse.builder()
                .id(c.getId())
                .complaintNumber(c.getComplaintNumber())
                .title(c.getTitle())
                .description(c.getDescription())
                .category(c.getCategory())
                .priority(c.getPriority())
                .status(c.getStatus())
                .location(c.getLocation())
                .imageUrl(c.getImageUrl())
                .userId(c.getUser().getId())
                .userName(c.getUser().getName())
                .assignedDepartment(c.getAssignedDepartment() != null ? c.getAssignedDepartment().getDepartmentName() : null)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
