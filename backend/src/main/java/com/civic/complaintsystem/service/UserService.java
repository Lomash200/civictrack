package com.civic.complaintsystem.service;

import com.civic.complaintsystem.dto.AuthDtos.ChangePasswordRequest;
import com.civic.complaintsystem.dto.UserDtos.ProfileResponse;
import com.civic.complaintsystem.dto.UserDtos.ProfileUpdateRequest;
import com.civic.complaintsystem.entity.User;
import com.civic.complaintsystem.exception.ApiException;
import com.civic.complaintsystem.exception.ResourceNotFoundException;
import com.civic.complaintsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public ProfileResponse getProfile(String email) {
        return toResponse(getUserByEmail(email));
    }

    public ProfileResponse updateProfile(String email, ProfileUpdateRequest request) {
        User user = getUserByEmail(email);
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        return toResponse(userRepository.save(user));
    }

    public ProfileResponse uploadProfilePhoto(String email, MultipartFile file) {
        User user = getUserByEmail(email);
        String url = fileStorageService.store(file);
        user.setProfilePhotoUrl(url);
        return toResponse(userRepository.save(user));
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = getUserByEmail(email);
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new ApiException("Old password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private ProfileResponse toResponse(User user) {
        return ProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
