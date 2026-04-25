package com.miniorange.recruitmentmanagementservice.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class GenerateJdResponse {
    @JsonProperty("job_title")
    private String jobTitle;

    private String summary;

    private List<String> responsibilities;

    @JsonProperty("required_qualifications")
    private List<String> requiredQualifications;

    @JsonProperty("preferred_qualifications")
    private List<String> preferredQualifications;

    @JsonProperty("bias_check")
    private Map<String, Object> biasCheck;
}

