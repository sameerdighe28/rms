package com.miniorange.recruitmentmanagementservice.service.impl;

import com.miniorange.recruitmentmanagementservice.dto.response.MlEngineMatchResponse;
import com.miniorange.recruitmentmanagementservice.dto.response.ResumeMatchResponse;
import com.miniorange.recruitmentmanagementservice.entity.CandidateProfile;
import com.miniorange.recruitmentmanagementservice.entity.Job;
import com.miniorange.recruitmentmanagementservice.enums.CandidateCategory;
import com.miniorange.recruitmentmanagementservice.enums.JobCategory;
import com.miniorange.recruitmentmanagementservice.exception.BadRequestException;
import com.miniorange.recruitmentmanagementservice.exception.ResourceNotFoundException;
import com.miniorange.recruitmentmanagementservice.repository.CandidateProfileRepository;
import com.miniorange.recruitmentmanagementservice.repository.JobRepository;
import com.miniorange.recruitmentmanagementservice.service.ResumeMatchingService;
import com.miniorange.recruitmentmanagementservice.service.ResumeStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeMatchingServiceImpl implements ResumeMatchingService {

    private final JobRepository jobRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RestTemplate restTemplate;
    private final ResumeStorageService resumeStorageService;

    @Value("${app.ml-engine.base-url:http://127.0.0.1:8000}")
    private String mlEngineBaseUrl;

    @Override
    public ResumeMatchResponse matchCandidatesForJob(UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        // Get candidates matching the job category
        CandidateCategory candidateCategory = job.getCategory() == JobCategory.TECHNICAL
                ? CandidateCategory.TECHNICAL
                : CandidateCategory.NON_TECHNICAL;

        List<CandidateProfile> candidates = candidateProfileRepository.findByCategory(candidateCategory);

        if (candidates.isEmpty()) {
            throw new BadRequestException("No candidates found matching the job category: " + job.getCategory());
        }

        // Filter candidates that have a locally stored resume
        List<CandidateProfile> candidatesWithResume = candidates.stream()
                .filter(cp -> cp.getResumeUrl() != null && !cp.getResumeUrl().isBlank())
                .collect(Collectors.toList());

        if (candidatesWithResume.isEmpty()) {
            throw new BadRequestException("No candidates with uploaded resumes found for category: " + job.getCategory());
        }

        // Build a map: resume filename → CandidateProfile (to correlate ML response back)
        Map<String, CandidateProfile> resumeFilenameToCandidateMap = new LinkedHashMap<>();

        // Build multipart form-data request
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        // Add job_description
        body.add("job_description", job.getDescription());

        // Add job_skills as comma-separated string
        String skillsStr = job.getSkillset() != null ? String.join(", ", job.getSkillset()) : "";
        body.add("job_skills", skillsStr);

        // Read each candidate's resume from local file system and add as file part
        for (CandidateProfile cp : candidatesWithResume) {
            try {
                Path resumePath = resumeStorageService.getResumePath(cp.getResumeUrl());
                String filename = resumePath.getFileName().toString();

                FileSystemResource fileResource = new FileSystemResource(resumePath.toFile());
                body.add("files", fileResource);
                resumeFilenameToCandidateMap.put(filename, cp);

                log.info("Added local resume for candidate: {} ({})", cp.getUser().getFullName(), filename);
            } catch (Exception ex) {
                log.warn("Failed to read resume for candidate {}: {}", cp.getUser().getFullName(), ex.getMessage());
            }
        }

        if (resumeFilenameToCandidateMap.isEmpty()) {
            throw new BadRequestException("Could not read any candidate resumes from local storage.");
        }

        // Call the ML engine
        try {
            String url = mlEngineBaseUrl + "/match";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<MlEngineMatchResponse> mlResponse = restTemplate.exchange(
                    url, HttpMethod.POST, requestEntity, MlEngineMatchResponse.class
            );

            if (mlResponse.getBody() == null) {
                throw new BadRequestException("ML engine returned empty response");
            }

            MlEngineMatchResponse mlResult = mlResponse.getBody();
            log.info("ML engine returned {} results for job: {}", mlResult.getResults().size(), job.getTitle());

            return mapToResumeMatchResponse(job, mlResult, resumeFilenameToCandidateMap);

        } catch (RestClientException ex) {
            log.error("Failed to call ML engine for resume matching: {}", ex.getMessage());
            throw new BadRequestException("Failed to connect to resume matching engine. Please try again later.");
        }
    }

    private ResumeMatchResponse mapToResumeMatchResponse(
            Job job,
            MlEngineMatchResponse mlResult,
            Map<String, CandidateProfile> resumeFilenameMap) {

        List<ResumeMatchResponse.MatchedCandidate> matchedCandidates = new ArrayList<>();

        if (mlResult.getResults() != null) {
            for (MlEngineMatchResponse.MlMatchResult result : mlResult.getResults()) {
                CandidateProfile cp = resumeFilenameMap.get(result.getResume());
                if (cp != null) {
                    matchedCandidates.add(buildMatchedCandidate(cp, result));
                } else {
                    log.warn("ML engine returned result for unknown resume file: {}", result.getResume());
                }
            }
        }

        // Sort by score descending
        matchedCandidates.sort((a, b) -> Double.compare(b.getMatchScore(), a.getMatchScore()));

        // Map best candidate
        ResumeMatchResponse.MatchedCandidate bestCandidate = null;
        if (mlResult.getBestCandidate() != null) {
            CandidateProfile bestCp = resumeFilenameMap.get(mlResult.getBestCandidate().getResume());
            if (bestCp != null) {
                bestCandidate = buildMatchedCandidate(bestCp, mlResult.getBestCandidate());
            }
        }

        return ResumeMatchResponse.builder()
                .jobId(job.getId())
                .jobTitle(job.getTitle())
                .jobRole(mlResult.getJobRole())
                .matchedCandidates(matchedCandidates)
                .bestCandidate(bestCandidate)
                .build();
    }

    private ResumeMatchResponse.MatchedCandidate buildMatchedCandidate(
            CandidateProfile cp, MlEngineMatchResponse.MlMatchResult result) {
        return ResumeMatchResponse.MatchedCandidate.builder()
                .candidateProfileId(cp.getId())
                .candidateName(cp.getUser().getFullName())
                .candidateEmail(cp.getUser().getEmail())
                .skills(cp.getSkills())
                .experienceYears(result.getYears())
                .matchScore(result.getScore() * 100) // Convert 0-1 to percentage
                .resumeUrl(cp.getResumeUrl())
                .build();
    }
}
