package com.miniorange.recruitmentmanagementservice.service.impl;

import com.miniorange.recruitmentmanagementservice.dto.request.MockTestSubmitRequest;
import com.miniorange.recruitmentmanagementservice.dto.response.MockQuestionDTO;
import com.miniorange.recruitmentmanagementservice.dto.response.MockTestResultResponse;
import com.miniorange.recruitmentmanagementservice.dto.response.MockTestStartResponse;
import com.miniorange.recruitmentmanagementservice.entity.*;
import com.miniorange.recruitmentmanagementservice.enums.MockTestCategory;
import com.miniorange.recruitmentmanagementservice.exception.BadRequestException;
import com.miniorange.recruitmentmanagementservice.exception.ResourceNotFoundException;
import com.miniorange.recruitmentmanagementservice.repository.*;
import com.miniorange.recruitmentmanagementservice.service.MockTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MockTestServiceImpl implements MockTestService {

    private final MockQuestionRepository mockQuestionRepository;
    private final MockTestAttemptRepository mockTestAttemptRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public MockTestStartResponse startTest(UUID applicationId, String candidateEmail) {
        User user = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        // Verify application belongs to this candidate
        if (!application.getCandidateProfile().getId().equals(profile.getId())) {
            throw new BadRequestException("This application does not belong to you");
        }

        // Check if already attempted
        if (mockTestAttemptRepository.existsByJobApplicationId(applicationId)) {
            throw new BadRequestException("You have already taken the mock test for this application");
        }

        // Determine mock test category based on job title keywords
        MockTestCategory category = determineCategoryFromJob(application.getJob());

        // Fetch questions for this category
        List<MockQuestion> allQuestions = mockQuestionRepository.findByCategory(category);
        if (allQuestions.isEmpty()) {
            throw new BadRequestException("No mock test questions available for category: " + category);
        }

        // Shuffle and pick up to 10 questions
        Collections.shuffle(allQuestions);
        List<MockQuestion> selectedQuestions = allQuestions.stream().limit(10).collect(Collectors.toList());

        // Create attempt
        MockTestAttempt attempt = MockTestAttempt.builder()
                .candidateProfile(profile)
                .jobApplication(application)
                .category(category)
                .totalQuestions(selectedQuestions.size())
                .score(0)
                .completed(false)
                .build();

        attempt = mockTestAttemptRepository.save(attempt);

        List<MockQuestionDTO> questionDTOs = selectedQuestions.stream()
                .map(q -> MockQuestionDTO.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .optionA(q.getOptionA())
                        .optionB(q.getOptionB())
                        .optionC(q.getOptionC())
                        .optionD(q.getOptionD())
                        .build())
                .collect(Collectors.toList());

        return MockTestStartResponse.builder()
                .attemptId(attempt.getId())
                .category(category.name())
                .totalQuestions(selectedQuestions.size())
                .questions(questionDTOs)
                .build();
    }

    @Override
    @Transactional
    public MockTestResultResponse submitTest(UUID attemptId, MockTestSubmitRequest request, String candidateEmail) {
        User user = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        MockTestAttempt attempt = mockTestAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Test attempt not found"));

        if (!attempt.getCandidateProfile().getId().equals(profile.getId())) {
            throw new BadRequestException("This test attempt does not belong to you");
        }

        if (attempt.isCompleted()) {
            throw new BadRequestException("This test has already been submitted");
        }

        // Score the test
        int score = 0;
        Map<UUID, String> answers = request.getAnswers();
        if (answers != null) {
            for (Map.Entry<UUID, String> entry : answers.entrySet()) {
                Optional<MockQuestion> questionOpt = mockQuestionRepository.findById(entry.getKey());
                if (questionOpt.isPresent()) {
                    MockQuestion question = questionOpt.get();
                    if (question.getCorrectOption().equalsIgnoreCase(entry.getValue())) {
                        score++;
                    }
                }
            }
        }

        attempt.setScore(score);
        attempt.setCompleted(true);
        attempt.setCompletedAt(LocalDateTime.now());
        attempt = mockTestAttemptRepository.save(attempt);

        return mapToResult(attempt);
    }

    @Override
    public MockTestResultResponse getTestResult(UUID applicationId, String candidateEmail) {
        User user = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        MockTestAttempt attempt = mockTestAttemptRepository.findByJobApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("No mock test attempt found for this application"));

        if (!attempt.getCandidateProfile().getId().equals(profile.getId())) {
            throw new BadRequestException("This test result does not belong to you");
        }

        return mapToResult(attempt);
    }

    private MockTestCategory determineCategoryFromJob(Job job) {
        String title = job.getTitle().toLowerCase();
        if (title.contains("backend") || title.contains("java") || title.contains("spring") || title.contains("node") || title.contains("python") || title.contains("server")) {
            return MockTestCategory.BACKEND_DEVELOPER;
        } else if (title.contains("frontend") || title.contains("react") || title.contains("angular") || title.contains("vue") || title.contains("ui") || title.contains("html") || title.contains("css")) {
            return MockTestCategory.FRONTEND_DEVELOPER;
        } else if (title.contains("marketing") || title.contains("seo") || title.contains("content") || title.contains("digital")) {
            return MockTestCategory.MARKETING;
        } else if (title.contains("sales") || title.contains("business development") || title.contains("account")) {
            return MockTestCategory.SALESMAN;
        } else if (title.contains("design") || title.contains("graphic") || title.contains("ux") || title.contains("creative")) {
            return MockTestCategory.DESIGNER;
        }
        // Default: if job is TECHNICAL -> BACKEND_DEVELOPER, else -> MARKETING
        if (job.getCategory().name().equals("TECHNICAL")) {
            return MockTestCategory.BACKEND_DEVELOPER;
        }
        return MockTestCategory.MARKETING;
    }

    private MockTestResultResponse mapToResult(MockTestAttempt attempt) {
        return MockTestResultResponse.builder()
                .attemptId(attempt.getId())
                .jobApplicationId(attempt.getJobApplication().getId())
                .category(attempt.getCategory().name())
                .score(attempt.getScore())
                .totalQuestions(attempt.getTotalQuestions())
                .completed(attempt.isCompleted())
                .completedAt(attempt.getCompletedAt())
                .build();
    }
}

