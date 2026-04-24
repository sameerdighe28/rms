package com.miniorange.recruitmentmanagementservice.repository;

import com.miniorange.recruitmentmanagementservice.entity.MockTestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MockTestAttemptRepository extends JpaRepository<MockTestAttempt, UUID> {

    Optional<MockTestAttempt> findByJobApplicationId(UUID jobApplicationId);

    List<MockTestAttempt> findByCandidateProfileId(UUID candidateProfileId);

    boolean existsByJobApplicationId(UUID jobApplicationId);
}

