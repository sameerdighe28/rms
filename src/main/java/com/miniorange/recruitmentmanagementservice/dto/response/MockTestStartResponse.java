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
public class MockTestStartResponse {

    private UUID attemptId;
    private String category;
    private int totalQuestions;
    private List<MockQuestionDTO> questions;
}

