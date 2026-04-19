package com.miniorange.recruitmentmanagementservice.controller;

import com.miniorange.recruitmentmanagementservice.dto.request.CreateHrRequest;
import com.miniorange.recruitmentmanagementservice.dto.response.CompanyResponse;
import com.miniorange.recruitmentmanagementservice.dto.response.UserResponse;
import com.miniorange.recruitmentmanagementservice.service.CompanyService;
import com.miniorange.recruitmentmanagementservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coo")
@RequiredArgsConstructor
@PreAuthorize("hasRole('COO')")
public class CooController {

    private final CompanyService companyService;
    private final UserService userService;

    /**
     * List all companies (read-only for COO)
     */
    @GetMapping("/companies")
    public ResponseEntity<List<CompanyResponse>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    /**
     * COO onboards HR — HR is automatically assigned to the COO's company.
     * No companyId needed in request body; it's resolved from the authenticated COO.
     */
    @PostMapping("/hr")
    public ResponseEntity<UserResponse> createHr(
            @Valid @RequestBody CreateHrRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserResponse response = userService.createHrUnderCoo(request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    /**
     * List all HR users
     */
    @GetMapping("/hr")
    public ResponseEntity<List<UserResponse>> getAllHrs() {
        return ResponseEntity.ok(userService.getHrList());
    }
}
