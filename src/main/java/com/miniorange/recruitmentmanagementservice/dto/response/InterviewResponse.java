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
public class InterviewResponse {

    private UUID id;
    private UUID jobApplicationId;
    private String jobTitle;
    private String companyName;
    private String candidateName;
    private String candidateEmail;
    private LocalDateTime scheduledAt;
    private String status;
    private int postponeCount;
    private LocalDateTime createdAt;
}

