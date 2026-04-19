package com.miniorange.recruitmentmanagementservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SelectedCandidateDetailResponse {

    private UUID applicationId;
    private UUID jobId;
    private String jobTitle;
    private String companyName;
    private String status;

    // Candidate personal details
    private UUID candidateProfileId;
    private String candidateName;
    private String candidateEmail;
    private String candidateMobile;

    // Candidate professional details
    private String category;
    private List<String> skills;
    private int experienceYears;
    private String resumeUrl;
    private Double expectedSalaryMin;
    private Double expectedSalaryMax;
    private String expectedSalaryRange;
}

