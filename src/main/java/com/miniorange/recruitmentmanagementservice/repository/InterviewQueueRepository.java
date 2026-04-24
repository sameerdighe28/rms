package com.miniorange.recruitmentmanagementservice.repository;

import com.miniorange.recruitmentmanagementservice.entity.InterviewQueue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InterviewQueueRepository extends JpaRepository<InterviewQueue, UUID> {

    List<InterviewQueue> findByJobIdOrderByQueuePositionAsc(UUID jobId);

    Optional<InterviewQueue> findByJobApplicationId(UUID jobApplicationId);

    void deleteByJobApplicationId(UUID jobApplicationId);
}

