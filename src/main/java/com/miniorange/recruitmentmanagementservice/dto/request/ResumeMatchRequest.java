package com.miniorange.recruitmentmanagementservice.dto.request;

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
public class ResumeMatchRequest {

    private UUID jobId;
    private String jobTitle;
    private String jobDescription;
    private List<String> requiredSkills;
    private String jobCategory;
    private List<CandidateResumeData> candidates;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CandidateResumeData {
        private UUID candidateProfileId;
        private String candidateName;
        private String resumeUrl;
        private List<String> skills;
        private int experienceYears;
        private String category;
    }
}

