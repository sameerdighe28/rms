package com.miniorange.recruitmentmanagementservice.service;

import com.miniorange.recruitmentmanagementservice.dto.request.CreateCooRequest;
import com.miniorange.recruitmentmanagementservice.dto.request.CreateHrRequest;
import com.miniorange.recruitmentmanagementservice.dto.request.RegisterUserRequest;
import com.miniorange.recruitmentmanagementservice.dto.response.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse createUser(RegisterUserRequest request);

    UserResponse createHr(CreateHrRequest request);

    /**
     * Create COO with mandatory company assignment.
     */
    UserResponse createCoo(CreateCooRequest request);

    /**
     * Create HR under the COO's company. COO email is used to resolve the company.
     */
    UserResponse createHrUnderCoo(CreateHrRequest request, String cooEmail);

    List<UserResponse> getHrList();

    List<UserResponse> getCooList();
}
