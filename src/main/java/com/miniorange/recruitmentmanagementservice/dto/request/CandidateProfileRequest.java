package com.miniorange.recruitmentmanagementservice.dto.request;

import com.miniorange.recruitmentmanagementservice.enums.CandidateCategory;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class CandidateProfileRequest {

    @NotNull(message = "Category is required (TECHNICAL or NON_TECHNICAL)")
    private CandidateCategory category;

    private List<String> skills;

    private int experienceYears;

    @Positive(message = "Minimum expected salary must be positive")
    private Double expectedSalaryMin;

    @Positive(message = "Maximum expected salary must be positive")
    private Double expectedSalaryMax;
}
