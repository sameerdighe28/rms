package com.miniorange.recruitmentmanagementservice.service.impl;

import com.miniorange.recruitmentmanagementservice.dto.request.ScheduleInterviewRequest;
import com.miniorange.recruitmentmanagementservice.dto.response.InterviewResponse;
import com.miniorange.recruitmentmanagementservice.entity.*;
import com.miniorange.recruitmentmanagementservice.enums.ApplicationStatus;
import com.miniorange.recruitmentmanagementservice.enums.InterviewStatus;
import com.miniorange.recruitmentmanagementservice.exception.BadRequestException;
import com.miniorange.recruitmentmanagementservice.exception.ResourceNotFoundException;
import com.miniorange.recruitmentmanagementservice.repository.*;
import com.miniorange.recruitmentmanagementservice.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewServiceImpl implements InterviewService {

    private final InterviewRepository interviewRepository;
    private final InterviewQueueRepository interviewQueueRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public InterviewResponse scheduleInterview(UUID applicationId, ScheduleInterviewRequest request) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        if (application.getStatus() != ApplicationStatus.INTERVIEWING) {
            throw new BadRequestException("Application must be in INTERVIEWING status to schedule an interview");
        }

        // Check if interview already exists for this application
        if (interviewRepository.findByJobApplicationId(applicationId).isPresent()) {
            throw new BadRequestException("Interview already scheduled for this application");
        }

        Interview interview = Interview.builder()
                .jobApplication(application)
                .scheduledAt(request.getScheduledAt())
                .status(InterviewStatus.SCHEDULED)
                .postponeCount(0)
                .build();

        interview = interviewRepository.save(interview);

        // Add to interview queue for this job
        List<InterviewQueue> existingQueue = interviewQueueRepository.findByJobIdOrderByQueuePositionAsc(application.getJob().getId());
        int nextPosition = existingQueue.isEmpty() ? 1 : existingQueue.get(existingQueue.size() - 1).getQueuePosition() + 1;

        InterviewQueue queueEntry = InterviewQueue.builder()
                .job(application.getJob())
                .jobApplication(application)
                .queuePosition(nextPosition)
                .build();
        interviewQueueRepository.save(queueEntry);

        return mapToResponse(interview);
    }

    @Override
    public List<InterviewResponse> getInterviewsByCandidate(String candidateEmail) {
        User user = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        return interviewRepository.findByJobApplicationCandidateProfileId(profile.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InterviewResponse postponeInterview(UUID interviewId, String candidateEmail) {
        User user = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + interviewId));

        // Verify this interview belongs to the candidate
        if (!interview.getJobApplication().getCandidateProfile().getId().equals(profile.getId())) {
            throw new BadRequestException("This interview does not belong to you");
        }

        if (interview.getStatus() != InterviewStatus.SCHEDULED) {
            throw new BadRequestException("Only scheduled interviews can be postponed");
        }

        if (interview.getPostponeCount() >= 2) {
            throw new BadRequestException("Maximum postponement limit (2) reached");
        }

        // Mark interview as postponed
        interview.setStatus(InterviewStatus.POSTPONED);
        interview.setPostponeCount(interview.getPostponeCount() + 1);
        interviewRepository.save(interview);

        UUID jobId = interview.getJobApplication().getJob().getId();

        // Move this candidate to end of queue
        List<InterviewQueue> queue = interviewQueueRepository.findByJobIdOrderByQueuePositionAsc(jobId);

        // Remove postponed candidate from current position
        InterviewQueue postponedEntry = queue.stream()
                .filter(q -> q.getJobApplication().getId().equals(interview.getJobApplication().getId()))
                .findFirst()
                .orElse(null);

        if (postponedEntry != null) {
            int maxPosition = queue.stream().mapToInt(InterviewQueue::getQueuePosition).max().orElse(0);
            postponedEntry.setQueuePosition(maxPosition + 1);
            interviewQueueRepository.save(postponedEntry);
        }

        // Promote next candidate in queue - give them the interview slot
        List<InterviewQueue> updatedQueue = interviewQueueRepository.findByJobIdOrderByQueuePositionAsc(jobId);
        for (InterviewQueue nextInQueue : updatedQueue) {
            if (nextInQueue.getJobApplication().getId().equals(interview.getJobApplication().getId())) {
                continue; // Skip the postponed candidate
            }
            // Check if next candidate has a scheduled interview already
            var nextInterview = interviewRepository.findByJobApplicationId(nextInQueue.getJobApplication().getId());
            if (nextInterview.isPresent() && nextInterview.get().getStatus() == InterviewStatus.SCHEDULED) {
                // Already has a scheduled interview, skip
                continue;
            }
            if (nextInterview.isPresent() && nextInterview.get().getStatus() == InterviewStatus.POSTPONED) {
                // Re-schedule the postponed candidate with the same time slot
                Interview ni = nextInterview.get();
                ni.setStatus(InterviewStatus.SCHEDULED);
                ni.setScheduledAt(interview.getScheduledAt());
                interviewRepository.save(ni);
                break;
            }
            break;
        }

        return mapToResponse(interview);
    }

    private InterviewResponse mapToResponse(Interview interview) {
        JobApplication app = interview.getJobApplication();
        return InterviewResponse.builder()
                .id(interview.getId())
                .jobApplicationId(app.getId())
                .jobTitle(app.getJob().getTitle())
                .companyName(app.getJob().getCompany().getName())
                .candidateName(app.getCandidateProfile().getUser().getFullName())
                .candidateEmail(app.getCandidateProfile().getUser().getEmail())
                .scheduledAt(interview.getScheduledAt())
                .status(interview.getStatus().name())
                .postponeCount(interview.getPostponeCount())
                .createdAt(interview.getCreatedAt())
                .build();
    }
}

