package com.miniorange.recruitmentmanagementservice.dto.request;

import com.miniorange.recruitmentmanagementservice.enums.JobCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class PostJobRequest {

    @NotBlank(message = "Job title is required")
    private String title;

    @NotBlank(message = "Job description is required")
    private String description;

    private List<String> skillset;

    @NotNull(message = "Job category is required (TECHNICAL or NON_TECHNICAL)")
    private JobCategory category;

    private String location;

    @Positive(message = "Minimum salary must be positive")
    private Double salaryMin;

    @Positive(message = "Maximum salary must be positive")
    private Double salaryMax;
}

