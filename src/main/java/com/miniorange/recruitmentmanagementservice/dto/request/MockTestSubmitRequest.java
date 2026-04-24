package com.miniorange.recruitmentmanagementservice.dto.request;

import lombok.Data;

import java.util.Map;
import java.util.UUID;

@Data
public class MockTestSubmitRequest {

    // Map of questionId -> selectedOption (A, B, C, D)
    private Map<UUID, String> answers;
}

