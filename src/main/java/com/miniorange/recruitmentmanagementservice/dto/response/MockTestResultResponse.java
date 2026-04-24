package com.miniorange.recruitmentmanagementservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MockTestResultResponse {

    private UUID attemptId;
    private UUID jobApplicationId;
    private String category;
    private int score;
    private int totalQuestions;
    private boolean completed;
    private LocalDateTime completedAt;
}

