package com.civic.complaintsystem.dto;

import com.civic.complaintsystem.entity.Role;
import lombok.*;

import java.time.LocalDateTime;

public class UserDtos {

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProfileResponse {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String profilePhotoUrl;
        private Role role;
        private LocalDateTime createdAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ProfileUpdateRequest {
        private String name;
        private String phone;
    }
}
