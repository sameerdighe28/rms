package com.miniorange.recruitmentmanagementservice.entity;

import com.miniorange.recruitmentmanagementservice.enums.MockTestCategory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "mock_test_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockTestAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_profile_id", nullable = false)
    private CandidateProfile candidateProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_application_id", nullable = false)
    private JobApplication jobApplication;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MockTestCategory category;

    @Builder.Default
    private int score = 0;

    private int totalQuestions;

    @CreationTimestamp
    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    @Builder.Default
    private boolean completed = false;
}

