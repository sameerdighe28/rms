package com.miniorange.recruitmentmanagementservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class GenerateJdRequest {
    @NotBlank
    private String role;
    private List<String> points;
}

