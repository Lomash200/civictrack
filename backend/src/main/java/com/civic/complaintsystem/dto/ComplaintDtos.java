package com.civic.complaintsystem.dto;

import com.civic.complaintsystem.entity.ComplaintCategory;
import com.civic.complaintsystem.entity.ComplaintStatus;
import com.civic.complaintsystem.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

public class ComplaintDtos {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ComplaintRequest {
        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Description is required")
        private String description;

        @NotNull(message = "Category is required")
        private ComplaintCategory category;

        private Priority priority; // optional - AI can auto-suggest if null

        private String location;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class StatusUpdateRequest {
        @NotNull
        private ComplaintStatus status;
        private Long departmentId;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class AssignDepartmentRequest {
        @NotNull
        private Long departmentId;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ComplaintResponse {
        private Long id;
        private String complaintNumber;
        private String title;
        private String description;
        private ComplaintCategory category;
        private Priority priority;
        private ComplaintStatus status;
        private String location;
        private String imageUrl;
        private Long userId;
        private String userName;
        private String assignedDepartment;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
