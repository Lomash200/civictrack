package com.civic.complaintsystem.controller;

import com.civic.complaintsystem.dto.AuthDtos.ChangePasswordRequest;
import com.civic.complaintsystem.dto.UserDtos.ProfileResponse;
import com.civic.complaintsystem.dto.UserDtos.ProfileUpdateRequest;
import com.civic.complaintsystem.entity.Notification;
import com.civic.complaintsystem.entity.User;
import com.civic.complaintsystem.service.NotificationService;
import com.civic.complaintsystem.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final NotificationService notificationService;

    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile(Authentication auth) {
        return ResponseEntity.ok(userService.getProfile(auth.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> updateProfile(Authentication auth, @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(auth.getName(), request));
    }

    @PostMapping(value = "/profile/photo", consumes = "multipart/form-data")
    public ResponseEntity<ProfileResponse> uploadPhoto(Authentication auth, @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(userService.uploadProfilePhoto(auth.getName(), file));
    }

    @PutMapping("/profile/change-password")
    public ResponseEntity<Map<String, String>> changePassword(Authentication auth, @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(auth.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getNotifications(Authentication auth) {
        User user = userService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(notificationService.getNotifications(user));
    }

    @GetMapping("/notifications/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(Authentication auth) {
        User user = userService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(Map.of("count", notificationService.unreadCount(user)));
    }

    @PutMapping("/notifications/mark-read")
    public ResponseEntity<Void> markRead(Authentication auth) {
        User user = userService.getUserByEmail(auth.getName());
        notificationService.markAllRead(user);
        return ResponseEntity.ok().build();
    }
}
