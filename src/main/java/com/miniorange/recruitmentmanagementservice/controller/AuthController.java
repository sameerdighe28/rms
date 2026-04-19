package com.miniorange.recruitmentmanagementservice.controller;

import com.miniorange.recruitmentmanagementservice.dto.request.LoginRequest;
import com.miniorange.recruitmentmanagementservice.dto.request.OtpVerificationRequest;
import com.miniorange.recruitmentmanagementservice.dto.request.RegisterUserRequest;
import com.miniorange.recruitmentmanagementservice.dto.response.AuthResponse;
import com.miniorange.recruitmentmanagementservice.dto.response.OtpSentResponse;
import com.miniorange.recruitmentmanagementservice.dto.response.UserResponse;
import com.miniorange.recruitmentmanagementservice.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Login with email and password.
     * For CANDIDATE: returns AuthResponse (JWT directly, no OTP needed).
     * For other roles: sends OTP and returns OtpSentResponse.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Object response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Step 2: Verify OTP received on email/mobile.
     * On success, returns a JWT token for subsequent API calls.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody OtpVerificationRequest request) {
        AuthResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Public endpoint for candidate self-registration.
     */
    @PostMapping("/register/candidate")
    public ResponseEntity<UserResponse> registerCandidate(@Valid @RequestBody RegisterUserRequest request) {
        UserResponse response = authService.registerCandidate(request);
        return ResponseEntity.ok(response);
    }
}

