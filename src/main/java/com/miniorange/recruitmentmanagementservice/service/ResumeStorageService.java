package com.miniorange.recruitmentmanagementservice.service;

import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

public interface ResumeStorageService {

    /**
     * Validates that the file is a PDF and saves it locally.
     * Returns the absolute path of the saved file.
     */
    String storeResume(MultipartFile file, String candidateEmail);

    /**
     * Returns the Path object for a stored resume.
     */
    Path getResumePath(String storedPath);
}

