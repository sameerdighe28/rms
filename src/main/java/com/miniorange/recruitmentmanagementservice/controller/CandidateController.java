package com.miniorange.recruitmentmanagementservice.controller;

import com.miniorange.recruitmentmanagementservice.dto.request.CandidateProfileRequest;
import com.miniorange.recruitmentmanagementservice.dto.response.CandidateProfileResponse;
import com.miniorange.recruitmentmanagementservice.dto.response.JobApplicationResponse;
import com.miniorange.recruitmentmanagementservice.dto.response.JobResponse;
import com.miniorange.recruitmentmanagementservice.service.CandidateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidate")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CANDIDATE')")
public class CandidateController {

    private final CandidateService candidateService;

    /**
     * Candidate creates profile with resume PDF upload (multipart/form-data).
     * Resume is stored locally and path saved in DB.
     */
    @PostMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CandidateProfileResponse> createProfile(
            @Valid @RequestPart("profile") CandidateProfileRequest request,
            @RequestPart(value = "resume", required = false) MultipartFile resumeFile,
            @AuthenticationPrincipal UserDetails userDetails) {
        CandidateProfileResponse response = candidateService.createProfile(request, resumeFile, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * Update candidate profile. Resume is optional on update — only replaced if new file uploaded.
     */
    @PutMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CandidateProfileResponse> updateProfile(
            @Valid @RequestPart("profile") CandidateProfileRequest request,
            @RequestPart(value = "resume", required = false) MultipartFile resumeFile,
            @AuthenticationPrincipal UserDetails userDetails) {
        CandidateProfileResponse response = candidateService.updateProfile(request, resumeFile, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * Get own profile
     */
    @GetMapping("/profile")
    public ResponseEntity<CandidateProfileResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        CandidateProfileResponse response = candidateService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * Browse jobs matching candidate's category (TECHNICAL/NON_TECHNICAL)
     */
    @GetMapping("/jobs")
    public ResponseEntity<List<JobResponse>> getAvailableJobs(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<JobResponse> jobs = candidateService.getAvailableJobs(userDetails.getUsername());
        return ResponseEntity.ok(jobs);
    }

    /**
     * Apply to a job
     */
    @PostMapping("/jobs/{jobId}/apply")
    public ResponseEntity<JobApplicationResponse> applyToJob(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal UserDetails userDetails) {
        JobApplicationResponse response = candidateService.applyToJob(jobId, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * View own applications
     */
    @GetMapping("/applications")
    public ResponseEntity<List<JobApplicationResponse>> getMyApplications(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<JobApplicationResponse> applications = candidateService.getMyApplications(userDetails.getUsername());
        return ResponseEntity.ok(applications);
    }
}
