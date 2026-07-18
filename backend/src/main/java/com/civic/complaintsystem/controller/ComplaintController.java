package com.civic.complaintsystem.controller;

import com.civic.complaintsystem.dto.ComplaintDtos.*;
import com.civic.complaintsystem.entity.User;
import com.civic.complaintsystem.service.ComplaintService;
import com.civic.complaintsystem.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;
    private final UserService userService;
    private final ObjectMapper objectMapper;

    /** Multipart endpoint: form fields "data" (JSON of ComplaintRequest) + optional "image" file. */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ComplaintResponse> raiseComplaint(
            Authentication auth,
            @RequestPart("data") String data,
            @RequestPart(value = "image", required = false) MultipartFile image) throws Exception {

        ComplaintRequest request = objectMapper.readValue(data, ComplaintRequest.class);
        User user = userService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(complaintService.raiseComplaint(user, request, image));
    }

    @GetMapping
    public ResponseEntity<Page<ComplaintResponse>> myComplaints(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        User user = userService.getUserByEmail(auth.getName());
        Page<ComplaintResponse> result = complaintService.getComplaintsForUser(
                user, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getById(id));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<ComplaintResponse> markResolved(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(complaintService.markResolved(id, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        complaintService.softDelete(id);
        return ResponseEntity.noContent().build();
    }
}
