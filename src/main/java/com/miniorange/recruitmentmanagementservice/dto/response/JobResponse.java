package com.miniorange.recruitmentmanagementservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobResponse {

    private UUID id;

    private String title;

    private String description;

    private List<String> skillset;

    private List<String> requiredQualifications;

    private List<String> preferredQualifications;

    private String category;

    private String location;

    private String companyName;

    private String postedBy;

    private Double salaryMin;

    private Double salaryMax;

    private String salaryRange;
}
