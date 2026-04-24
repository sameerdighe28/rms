package com.miniorange.recruitmentmanagementservice.service;

import com.miniorange.recruitmentmanagementservice.dto.request.ScheduleInterviewRequest;
import com.miniorange.recruitmentmanagementservice.dto.response.InterviewResponse;

import java.util.List;
import java.util.UUID;

public interface InterviewService {

    InterviewResponse scheduleInterview(UUID applicationId, ScheduleInterviewRequest request);

    List<InterviewResponse> getInterviewsByCandidate(String candidateEmail);

    InterviewResponse postponeInterview(UUID interviewId, String candidateEmail);
}

