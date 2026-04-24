package com.miniorange.recruitmentmanagementservice.repository;

import com.miniorange.recruitmentmanagementservice.entity.Interview;
import com.miniorange.recruitmentmanagementservice.enums.InterviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, UUID> {

    List<Interview> findByJobApplicationCandidateProfileIdAndStatus(UUID candidateProfileId, InterviewStatus status);

    List<Interview> findByJobApplicationCandidateProfileId(UUID candidateProfileId);

    Optional<Interview> findByJobApplicationId(UUID jobApplicationId);

    List<Interview> findByJobApplicationJobIdAndStatus(UUID jobId, InterviewStatus status);
}

