package com.civic.complaintsystem.service;

import com.civic.complaintsystem.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png", "image/webp", "image/jpg");

    /** Stores a file on disk and returns a relative public URL like /uploads/xxxx.jpg */
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException("File is empty");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new ApiException("Only JPG, PNG or WEBP images are allowed");
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new ApiException("File size must be under 10MB");
        }

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename());
            String extension = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf(".")) : "";
            String fileName = UUID.randomUUID() + extension;

            Path targetPath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetPath);

            return "/uploads/" + fileName;
        } catch (IOException e) {
            throw new ApiException("Failed to store file: " + e.getMessage());
        }
    }
}
