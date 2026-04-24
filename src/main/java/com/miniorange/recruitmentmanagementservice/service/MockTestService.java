package com.miniorange.recruitmentmanagementservice.service;

import com.miniorange.recruitmentmanagementservice.dto.request.MockTestSubmitRequest;
import com.miniorange.recruitmentmanagementservice.dto.response.MockTestResultResponse;
import com.miniorange.recruitmentmanagementservice.dto.response.MockTestStartResponse;

import java.util.UUID;

public interface MockTestService {

    MockTestStartResponse startTest(UUID applicationId, String candidateEmail);

    MockTestResultResponse submitTest(UUID attemptId, MockTestSubmitRequest request, String candidateEmail);

    MockTestResultResponse getTestResult(UUID applicationId, String candidateEmail);
}

