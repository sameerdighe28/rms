package com.miniorange.recruitmentmanagementservice.repository;

import com.miniorange.recruitmentmanagementservice.entity.MockQuestion;
import com.miniorange.recruitmentmanagementservice.enums.MockTestCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MockQuestionRepository extends JpaRepository<MockQuestion, UUID> {

    List<MockQuestion> findByCategory(MockTestCategory category);

    long countByCategory(MockTestCategory category);
}

