package com.miniorange.recruitmentmanagementservice.service.impl;

import com.miniorange.recruitmentmanagementservice.exception.BadRequestException;
import com.miniorange.recruitmentmanagementservice.service.ResumeStorageService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class ResumeStorageServiceImpl implements ResumeStorageService {

    @Value("${app.resume.upload-dir:./uploads/resumes}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
            log.info("Resume upload directory created/verified at: {}", uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create resume upload directory: " + uploadPath, e);
        }
    }

    @Override
    public String storeResume(MultipartFile file, String candidateEmail) {
        // Validate file is not empty
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Resume file is required and cannot be empty");
        }

        // Validate file size (extra check beyond Spring config)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BadRequestException("Resume file size must not exceed 10MB");
        }

        // Validate PDF format by content type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equalsIgnoreCase("application/pdf")) {
            throw new BadRequestException("Only PDF files are allowed. Received: " + contentType);
        }

        // Validate PDF format by file extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new BadRequestException("Only .pdf files are allowed. Received: " + originalFilename);
        }

        // Validate PDF magic bytes (first 4 bytes should be %PDF)
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[4];
            if (is.read(header) < 4 || header[0] != 0x25 || header[1] != 0x50 || header[2] != 0x44 || header[3] != 0x46) {
                throw new BadRequestException("Invalid PDF file. The file content does not appear to be a valid PDF");
            }
        } catch (IOException e) {
            throw new BadRequestException("Could not read resume file for validation");
        }

        // Generate unique filename: email_uuid.pdf
        String sanitizedEmail = candidateEmail.replaceAll("[^a-zA-Z0-9]", "_");
        String filename = sanitizedEmail + "_" + UUID.randomUUID().toString().substring(0, 8) + ".pdf";

        try {
            Path targetPath = uploadPath.resolve(filename).normalize();

            // Security check: ensure target is within upload directory
            if (!targetPath.startsWith(uploadPath)) {
                throw new BadRequestException("Invalid file path detected");
            }

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("Resume saved for {}: {}", candidateEmail, targetPath);

            return targetPath.toString();
        } catch (IOException e) {
            throw new BadRequestException("Failed to store resume file: " + e.getMessage());
        }
    }

    @Override
    public Path getResumePath(String storedPath) {
        Path path = Paths.get(storedPath).toAbsolutePath().normalize();
        if (!Files.exists(path)) {
            throw new BadRequestException("Resume file not found at: " + storedPath);
        }
        return path;
    }
}

