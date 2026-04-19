package com.miniorange.recruitmentmanagementservice.service;

import com.miniorange.recruitmentmanagementservice.dto.response.ResumeMatchResponse;

import java.util.UUID;

public interface ResumeMatchingService {

    /**
     * Triggers the Python ML engine to parse resumes and match candidates for a given job.
     */
    ResumeMatchResponse matchCandidatesForJob(UUID jobId);
}

