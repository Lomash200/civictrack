package com.civic.complaintsystem.dto;

import com.civic.complaintsystem.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

public class AuthDtos {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        private String phone;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ChangePasswordRequest {
        @NotBlank
        private String oldPassword;
        @NotBlank
        @Size(min = 6)
        private String newPassword;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private Long userId;
        private String name;
        private String email;
        private Role role;
    }
}
