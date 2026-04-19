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
public class ResumeMatchResponse {

    private UUID jobId;
    private String jobTitle;
    private String jobRole;
    private List<MatchedCandidate> matchedCandidates;
    private MatchedCandidate bestCandidate;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchedCandidate {
        private UUID candidateProfileId;
        private String candidateName;
        private String candidateEmail;
        private List<String> skills;
        private int experienceYears;
        private double matchScore;
        private String resumeUrl;
    }
}
