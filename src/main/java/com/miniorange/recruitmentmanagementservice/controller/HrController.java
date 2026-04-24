package com.miniorange.recruitmentmanagementservice.controller;

import com.miniorange.recruitmentmanagementservice.dto.request.PostJobRequest;
import com.miniorange.recruitmentmanagementservice.dto.request.ScheduleInterviewRequest;
import com.miniorange.recruitmentmanagementservice.dto.request.UpdateApplicationStatusRequest;
import com.miniorange.recruitmentmanagementservice.dto.response.*;
import com.miniorange.recruitmentmanagementservice.entity.CandidateProfile;
import com.miniorange.recruitmentmanagementservice.entity.JobApplication;
import com.miniorange.recruitmentmanagementservice.entity.User;
import com.miniorange.recruitmentmanagementservice.enums.ApplicationStatus;
import com.miniorange.recruitmentmanagementservice.exception.BadRequestException;
import com.miniorange.recruitmentmanagementservice.exception.ResourceNotFoundException;
import com.miniorange.recruitmentmanagementservice.repository.JobApplicationRepository;
import com.miniorange.recruitmentmanagementservice.service.InterviewService;
import com.miniorange.recruitmentmanagementservice.service.JobService;
import com.miniorange.recruitmentmanagementservice.service.ResumeMatchingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hr")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HR')")
public class HrController {

    private final JobService jobService;
    private final JobApplicationRepository jobApplicationRepository;
    private final ResumeMatchingService resumeMatchingService;
    private final InterviewService interviewService;

    /**
     * HR schedules an interview for an application (must be in INTERVIEWING status)
     */
    @PostMapping("/applications/{applicationId}/schedule-interview")
    public ResponseEntity<InterviewResponse> scheduleInterview(
            @PathVariable UUID applicationId,
            @Valid @RequestBody ScheduleInterviewRequest request) {
        InterviewResponse response = interviewService.scheduleInterview(applicationId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * HR posts a new job with skillset and description (technical or non-technical)
     * Salary range is optional.
     */
    @PostMapping("/jobs")
    public ResponseEntity<JobResponse> postJob(@Valid @RequestBody PostJobRequest request,
                                                @AuthenticationPrincipal UserDetails userDetails) {
        JobResponse response = jobService.postJob(request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * HR views jobs they have posted
     */
    @GetMapping("/jobs")
    public ResponseEntity<List<JobResponse>> getMyJobs(@AuthenticationPrincipal UserDetails userDetails) {
        List<JobResponse> jobs = jobService.getJobsByHr(userDetails.getUsername());
        return ResponseEntity.ok(jobs);
    }

    /**
     * HR views applications for a specific job
     */
    @GetMapping("/jobs/{jobId}/applications")
    public ResponseEntity<List<JobApplicationResponse>> getJobApplications(@PathVariable UUID jobId) {
        List<JobApplicationResponse> applications = jobApplicationRepository.findByJobId(jobId).stream()
                .map(app -> JobApplicationResponse.builder()
                        .id(app.getId())
                        .jobId(app.getJob().getId())
                        .jobTitle(app.getJob().getTitle())
                        .companyName(app.getJob().getCompany().getName())
                        .status(app.getStatus().name())
                        .candidateName(app.getCandidateProfile().getUser().getFullName())
                        .candidateEmail(app.getCandidateProfile().getUser().getEmail())
                        .appliedAt(app.getAppliedAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(applications);
    }

    /**
     * Trigger Python ML engine to parse resumes and find best matching candidates for a job
     */
    @PostMapping("/jobs/{jobId}/match-candidates")
    public ResponseEntity<ResumeMatchResponse> matchCandidatesForJob(@PathVariable UUID jobId) {
        ResumeMatchResponse response = resumeMatchingService.matchCandidatesForJob(jobId);
        return ResponseEntity.ok(response);
    }

    /**
     * Update application status (SHORTLISTED, INTERVIEWING, SELECTED, REJECTED)
     */
    @PutMapping("/applications/{applicationId}/status")
    public ResponseEntity<JobApplicationResponse> updateApplicationStatus(
            @PathVariable UUID applicationId,
            @Valid @RequestBody UpdateApplicationStatusRequest request) {

        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        // Validate status transition
        validateStatusTransition(application.getStatus(), request.getStatus());

        application.setStatus(request.getStatus());
        application = jobApplicationRepository.save(application);

        return ResponseEntity.ok(JobApplicationResponse.builder()
                .id(application.getId())
                .jobId(application.getJob().getId())
                .jobTitle(application.getJob().getTitle())
                .companyName(application.getJob().getCompany().getName())
                .status(application.getStatus().name())
                .candidateName(application.getCandidateProfile().getUser().getFullName())
                .candidateEmail(application.getCandidateProfile().getUser().getEmail())
                .appliedAt(application.getAppliedAt())
                .build());
    }

    /**
     * Get full details of selected candidates for a job (after completing interviews)
     * Only returns candidates with SELECTED status.
     */
    @GetMapping("/jobs/{jobId}/selected-candidates")
    public ResponseEntity<List<SelectedCandidateDetailResponse>> getSelectedCandidateDetails(@PathVariable UUID jobId) {
        List<JobApplication> selectedApplications = jobApplicationRepository.findByJobIdAndStatus(jobId, ApplicationStatus.SELECTED);

        if (selectedApplications.isEmpty()) {
            throw new ResourceNotFoundException("No selected candidates found for job id: " + jobId);
        }

        List<SelectedCandidateDetailResponse> details = selectedApplications.stream()
                .map(app -> {
                    CandidateProfile cp = app.getCandidateProfile();
                    User candidate = cp.getUser();
                    String salaryRange = (cp.getExpectedSalaryMin() != null && cp.getExpectedSalaryMax() != null)
                            ? String.format("%.1f-%.1f LPA", cp.getExpectedSalaryMin(), cp.getExpectedSalaryMax())
                            : null;
                    return SelectedCandidateDetailResponse.builder()
                            .applicationId(app.getId())
                            .jobId(app.getJob().getId())
                            .jobTitle(app.getJob().getTitle())
                            .companyName(app.getJob().getCompany().getName())
                            .status(app.getStatus().name())
                            .candidateProfileId(cp.getId())
                            .candidateName(candidate.getFullName())
                            .candidateEmail(candidate.getEmail())
                            .candidateMobile(candidate.getMobileNumber())
                            .category(cp.getCategory().name())
                            .skills(cp.getSkills())
                            .experienceYears(cp.getExperienceYears())
                            .resumeUrl(cp.getResumeUrl())
                            .expectedSalaryMin(cp.getExpectedSalaryMin())
                            .expectedSalaryMax(cp.getExpectedSalaryMax())
                            .expectedSalaryRange(salaryRange)
                            .build();
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(details);
    }

    private void validateStatusTransition(ApplicationStatus current, ApplicationStatus target) {
        // Define valid transitions
        switch (current) {
            case APPLIED -> {
                if (target != ApplicationStatus.SHORTLISTED && target != ApplicationStatus.REJECTED) {
                    throw new BadRequestException("Application in APPLIED status can only be moved to SHORTLISTED or REJECTED");
                }
            }
            case SHORTLISTED -> {
                if (target != ApplicationStatus.INTERVIEWING && target != ApplicationStatus.REJECTED) {
                    throw new BadRequestException("Application in SHORTLISTED status can only be moved to INTERVIEWING or REJECTED");
                }
            }
            case INTERVIEWING -> {
                if (target != ApplicationStatus.SELECTED && target != ApplicationStatus.REJECTED) {
                    throw new BadRequestException("Application in INTERVIEWING status can only be moved to SELECTED or REJECTED");
                }
            }
            case SELECTED, REJECTED -> throw new BadRequestException("Application in " + current + " status cannot be changed");
        }
    }
}

