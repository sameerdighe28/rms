package com.miniorange.recruitmentmanagementservice.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Maps the raw response from the Python ML resume matching engine.
 * Endpoint: POST http://127.0.0.1:8000/match
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MlEngineMatchResponse {

    @JsonProperty("job_role")
    private String jobRole;

    private List<MlMatchResult> results;

    @JsonProperty("best_candidate")
    private MlMatchResult bestCandidate;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MlMatchResult {
        private String resume;
        private double score;
        private String role;
        private int years;
    }
}

