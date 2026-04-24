# 🏢 Recruitment Management Service

A comprehensive **full-stack** recruitment management application built with **Spring Boot 4** + **React 19** (Vite + TypeScript), **Java 21**, **PostgreSQL**, and **Spring Security** with JWT + OTP-based two-factor authentication.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Roles & Permissions](#roles--permissions)
- [Authentication Flow](#authentication-flow)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Default Credentials](#default-credentials)
- [Sample API Requests](#sample-api-requests)
- [Database Schema](#database-schema)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Recruitment Management Service provides a role-based platform where:

- **Super Admins** manage companies (create & delete with full cascade) and onboard COOs
- **COOs** enlist companies and onboard HRs
- **HRs** post technical and non-technical jobs with skillsets, required/preferred qualifications, and optional salary ranges; trigger AI-powered resume matching; schedule interviews; manage interview workflows; and view selected candidate details
- **Candidates** create profiles, choose a category (Technical/Non-Technical), set expected salary range, browse matching jobs, apply, take mock tests, view scheduled interviews, and postpone interviews

All operations are secured via **JWT token-based authentication** with a **two-factor OTP verification** (sent to email and mobile).

### ✨ Key Features

- **🤖 AI Resume Matching** — Integrates with an external Python ML engine (`POST /match` with multipart form-data). Downloads candidate resume PDFs, sends them along with job description & skills, and returns ranked candidates with match scores and a best candidate pick
- **📋 Interview Workflow Management** — Full application status lifecycle: `APPLIED → SHORTLISTED → INTERVIEWING → SELECTED / REJECTED` with strict transition validation
- **📅 Interview Scheduling & Postponement** — HR can schedule interviews for candidates in INTERVIEWING status. Candidates can view their scheduled interviews on their dashboard and postpone up to 2 times. When postponed, the next candidate in the queue gets the interview slot, and the postponing candidate moves to the end of the queue
- **📝 Mock Tests** — After applying to a job, candidates can take a mock test with 10 MCQ questions auto-selected based on the job role (categories: Marketing, Backend Developer, Frontend Developer, Salesman, Designer). 100 questions seeded on startup (20 per category)
- **✅ Required & Preferred Qualifications** — HR can specify required qualifications (must-haves) and preferred qualifications (nice-to-haves) when posting a job, displayed to candidates on job listings
- **🗑️ Cascade Company Deletion** — Super Admin can delete a company, which cascade-deletes all associated job applications, jobs, and nullifies company references for associated users (COO, HR)
- **👤 Selected Candidate Details Sharing** — After selection, HR gets full candidate details (contact, skills, resume, salary expectations) for offer discussions
- **💰 Optional Salary Range on Jobs** — HR can post jobs with or without salary range (e.g., `6.0-10.0 LPA`)
- **💵 Optional Expected Salary for Candidates** — Candidates can set their salary expectations or leave them blank
- **🛡️ Edge Case Handling** — Salary range validation (min ≤ max), status transition guards, duplicate application prevention, empty result handling, interview postpone limits

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Java | 21 | Programming Language |
| Spring Boot | 4.0.5 | Backend Application Framework |
| Spring Security | 6.x | Authentication & Authorization |
| Spring Data JPA | - | ORM / Database Operations |
| PostgreSQL | 14+ | Relational Database |
| JSON Web Token (JWT) | jjwt 0.12.6 | Stateless API Authentication |
| React | 19.x | Frontend UI Library |
| Vite | 8.x | Frontend Build Tool |
| TypeScript | 6.x | Frontend Type Safety |
| React Router | 7.x | Client-Side Routing |
| Axios | - | HTTP Client |
| JavaMailSender | - | Email OTP Delivery |
| Twilio SDK | 10.6.4 | SMS OTP Delivery |
| RestTemplate | - | HTTP Client for ML Engine Integration |
| Python ML Engine | External | Resume Parsing & Candidate Matching |
| Lombok | - | Boilerplate Reduction |
| Gradle | 9.x | Build Tool |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              React Frontend (Vite + TypeScript)                  │
│  Login │ OTP │ SuperAdmin │ COO │ HR │ Candidate Pages          │
│  Interviews │ Mock Tests │ AuthContext │ ProtectedRoute          │
├─────────────────────────────────────────────────────────────────┤
│                        REST Controllers                         │
│  AuthController │ SuperAdminController │ CooController │ ...    │
├─────────────────────────────────────────────────────────────────┤
│                        Service Layer                            │
│  AuthService │ CompanyService │ JobService │ CandidateService   │
│  OtpService  │ EmailService  │ SmsService │ UserService         │
│  ResumeMatchingService │ InterviewService │ MockTestService     │
├─────────────────────────────────────────────────────────────────┤
│                     Security Layer                              │
│  JwtUtils │ JwtAuthFilter │ SecurityConfig │ UserDetailsService │
├─────────────────────────────────────────────────────────────────┤
│                      Repository Layer                           │
│  UserRepo │ CompanyRepo │ JobRepo │ CandidateProfileRepo │ ... │
│  InterviewRepo │ InterviewQueueRepo │ MockQuestionRepo │ ...   │
├─────────────────────────────────────────────────────────────────┤
│                    PostgreSQL Database                           │
│  users │ companies │ jobs │ candidate_profiles │ otp_tokens     │
│  interviews │ interview_queue │ mock_questions │ mock_test_...  │
├─────────────────────────────────────────────────────────────────┤
│                  External: Python ML Engine                      │
│  POST /match (multipart: job_description, job_skills, files)    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Roles & Permissions

| Role | Permissions |
|---|---|
| **SUPER_ADMIN** | Create companies, delete companies (cascade deletes all jobs, applications, nullifies users), create COO users (with mandatory company assignment), view all companies & COOs |
| **COO** | Belongs to a specific company. View companies (read-only), onboard HR users (automatically assigned to COO's company), view HRs |
| **HR** | Post jobs (technical/non-technical) with skillsets, required & preferred qualifications, and optional salary range; trigger AI resume matching; schedule interviews for candidates; manage application status (APPLIED → SHORTLISTED → INTERVIEWING → SELECTED/REJECTED); view selected candidate full details |
| **CANDIDATE** | Register self, **login directly without OTP**, create profile (choose TECHNICAL or NON_TECHNICAL category, upload resume PDF, set optional expected salary range), browse matching jobs, apply to jobs, view applications, take mock tests, view scheduled interviews, postpone interviews (max 2 times) |

---

## Authentication Flow

The application uses a **two-step authentication** process for admin roles, while **Candidates login directly** with just email and password (no OTP required):

```
For CANDIDATE:
   POST /api/auth/login
   → Validates email + password
   → Returns JWT token directly (no OTP step)

For SUPER_ADMIN, COO, HR:
   Step 1: Login with Email + Password
      POST /api/auth/login
      → Validates credentials
      → Generates 6-digit OTP
      → Sends OTP to registered email AND mobile number
      → Returns confirmation with masked mobile number

   Step 2: Verify OTP
      POST /api/auth/verify-otp
      → Validates OTP (5-minute expiry)
      → Issues JWT token (24-hour expiry)
      → Returns Bearer token for API access

Step 3: Access Protected APIs
   Authorization: Bearer <jwt-token>
   → Token is validated on every request
   → Role-based access control enforced
```

---

## API Endpoints

### 🔓 Authentication (Public)

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/auth/login` | Login (Candidates get JWT directly; others get OTP) | `{ "email", "password" }` |
| `POST` | `/api/auth/verify-otp` | Verify OTP & get JWT (non-candidate roles only) | `{ "email", "otp" }` |
| `POST` | `/api/auth/register/candidate` | Candidate self-registration | `{ "email", "password", "fullName", "mobileNumber" }` |

### 🔴 Super Admin (`SUPER_ADMIN` role required)

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/super-admin/companies` | Create a company | `{ "name", "address", "website" }` |
| `DELETE` | `/api/super-admin/companies/{id}` | Delete a company (cascade) | - |
| `GET` | `/api/super-admin/companies` | List all companies | - |
| `POST` | `/api/super-admin/coo` | Create a COO user (with mandatory company) | `{ "email", "password", "fullName", "mobileNumber", "companyId" }` |
| `GET` | `/api/super-admin/coo` | List all COOs | - |

### 🟠 COO (`COO` role required)

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `GET` | `/api/coo/companies` | List all companies (read-only) | - |
| `POST` | `/api/coo/hr` | Onboard HR (auto-assigned to COO's company) | `{ "email", "password", "fullName", "mobileNumber" }` |
| `GET` | `/api/coo/hr` | List all HR users | - |

### 🟡 HR (`HR` role required)

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/hr/jobs` | Post a new job (with qualifications, salary range optional) | `{ "title", "description", "skillset", "requiredQualifications?", "preferredQualifications?", "category", "location", "salaryMin?", "salaryMax?" }` |
| `GET` | `/api/hr/jobs` | List jobs posted by this HR | - |
| `GET` | `/api/hr/jobs/{jobId}/applications` | View applications for a job | - |
| `POST` | `/api/hr/jobs/{jobId}/match-candidates` | Trigger ML resume matching for a job | - |
| `PUT` | `/api/hr/applications/{applicationId}/status` | Update application status | `{ "status" }` |
| `POST` | `/api/hr/applications/{applicationId}/schedule-interview` | Schedule interview for a candidate | `{ "scheduledAt" }` |
| `GET` | `/api/hr/jobs/{jobId}/selected-candidates` | Get full details of selected candidates | - |

### 🟢 Candidate (`CANDIDATE` role required)

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/candidate/profile` | Create profile (choose category) | multipart: `profile` (JSON) + `resume` (file) |
| `PUT` | `/api/candidate/profile` | Update profile | multipart: `profile` (JSON) + `resume` (file, optional) |
| `GET` | `/api/candidate/profile` | Get own profile | - |
| `GET` | `/api/candidate/jobs` | Browse jobs matching category | - |
| `POST` | `/api/candidate/jobs/{jobId}/apply` | Apply to a job | - |
| `GET` | `/api/candidate/applications` | View own applications | - |
| `GET` | `/api/candidate/interviews` | View own scheduled interviews | - |
| `PUT` | `/api/candidate/interviews/{interviewId}/postpone` | Postpone an interview (max 2 times) | - |
| `POST` | `/api/candidate/applications/{appId}/mock-test/start` | Start a mock test for an application | - |
| `POST` | `/api/candidate/mock-test/{attemptId}/submit` | Submit mock test answers | `{ "answers": { "questionId": "A/B/C/D" } }` |
| `GET` | `/api/candidate/applications/{appId}/mock-test/result` | Get mock test result | - |

---

## Project Structure

```
src/main/java/com/miniorange/recruitmentmanagementservice/
│
├── RecruitmentManagementServiceApplication.java   # Main entry point
│
├── config/
│   ├── DataInitializer.java              # Seeds SUPER_ADMIN + 100 mock test questions
│   ├── RestTemplateConfig.java           # RestTemplate bean for ML engine calls
│   └── TwilioConfig.java                 # Twilio SMS client initialization
│
├── controller/
│   ├── AuthController.java               # /api/auth/** (public endpoints)
│   ├── SuperAdminController.java         # /api/super-admin/** 
│   ├── CooController.java                # /api/coo/**
│   ├── HrController.java                 # /api/hr/** (+ schedule interview)
│   └── CandidateController.java          # /api/candidate/** (+ interviews, mock tests)
│
├── dto/
│   ├── request/
│   │   ├── LoginRequest.java
│   │   ├── OtpVerificationRequest.java
│   │   ├── RegisterUserRequest.java
│   │   ├── CreateCompanyRequest.java
│   │   ├── CreateHrRequest.java
│   │   ├── PostJobRequest.java           # + requiredQualifications, preferredQualifications
│   │   ├── CandidateProfileRequest.java
│   │   ├── UpdateApplicationStatusRequest.java
│   │   ├── ScheduleInterviewRequest.java # NEW — schedule interview datetime
│   │   ├── MockTestSubmitRequest.java    # NEW — submit mock test answers
│   │   └── ResumeMatchRequest.java
│   └── response/
│       ├── AuthResponse.java
│       ├── OtpSentResponse.java
│       ├── UserResponse.java
│       ├── CompanyResponse.java
│       ├── JobResponse.java              # + requiredQualifications, preferredQualifications
│       ├── CandidateProfileResponse.java
│       ├── JobApplicationResponse.java
│       ├── InterviewResponse.java        # NEW — interview details
│       ├── MockQuestionDTO.java          # NEW — question without answer
│       ├── MockTestStartResponse.java    # NEW — test start with questions
│       ├── MockTestResultResponse.java   # NEW — test score/result
│       ├── ResumeMatchResponse.java
│       ├── MlEngineMatchResponse.java
│       ├── SelectedCandidateDetailResponse.java
│       ├── ApiErrorResponse.java
│       └── MessageResponse.java
│
├── entity/
│   ├── User.java                         # Users table (all roles)
│   ├── Company.java                      # Companies table
│   ├── Job.java                          # Jobs with skillsets + qualifications
│   ├── CandidateProfile.java             # Candidate profiles (tech/non-tech)
│   ├── JobApplication.java               # Job applications
│   ├── OtpToken.java                     # OTP tokens for 2FA
│   ├── Interview.java                    # NEW — scheduled interviews with postpone tracking
│   ├── InterviewQueue.java               # NEW — interview queue per job
│   ├── MockQuestion.java                 # NEW — MCQ question bank
│   └── MockTestAttempt.java              # NEW — candidate test attempts with scores
│
├── enums/
│   ├── Role.java                         # SUPER_ADMIN, COO, HR, CANDIDATE
│   ├── JobCategory.java                  # TECHNICAL, NON_TECHNICAL
│   ├── CandidateCategory.java            # TECHNICAL, NON_TECHNICAL
│   ├── ApplicationStatus.java            # APPLIED, SHORTLISTED, INTERVIEWING, SELECTED, REJECTED
│   ├── InterviewStatus.java              # NEW — SCHEDULED, COMPLETED, POSTPONED, CANCELLED
│   └── MockTestCategory.java             # NEW — MARKETING, BACKEND_DEVELOPER, FRONTEND_DEVELOPER, SALESMAN, DESIGNER
│
├── exception/
│   ├── ResourceNotFoundException.java    # 404 errors
│   ├── BadRequestException.java          # 400 errors
│   ├── OtpExpiredException.java          # OTP validation errors
│   └── GlobalExceptionHandler.java       # Centralized exception handling
│
├── repository/
│   ├── UserRepository.java              # + findByCompanyId
│   ├── CompanyRepository.java
│   ├── JobRepository.java
│   ├── CandidateProfileRepository.java
│   ├── JobApplicationRepository.java
│   ├── OtpTokenRepository.java
│   ├── InterviewRepository.java          # NEW
│   ├── InterviewQueueRepository.java     # NEW
│   ├── MockQuestionRepository.java       # NEW
│   └── MockTestAttemptRepository.java    # NEW
│
├── security/
│   ├── JwtUtils.java                     # JWT token generation & validation
│   ├── JwtAuthenticationFilter.java      # Intercepts requests, validates JWT
│   ├── JwtAuthEntryPoint.java            # Handles 401 unauthorized responses
│   ├── CustomUserDetailsService.java     # Loads users from DB for Spring Security
│   └── SecurityConfig.java              # Security filter chain & role-based access
│
└── service/
    ├── AuthService.java
    ├── CompanyService.java
    ├── UserService.java
    ├── JobService.java
    ├── CandidateService.java
    ├── ResumeMatchingService.java
    ├── InterviewService.java             # NEW
    ├── MockTestService.java              # NEW
    ├── OtpService.java
    ├── EmailService.java
    ├── SmsService.java
    └── impl/
        ├── AuthServiceImpl.java
        ├── CompanyServiceImpl.java       # + cascade delete
        ├── UserServiceImpl.java
        ├── JobServiceImpl.java           # + qualifications mapping
        ├── CandidateServiceImpl.java     # + qualifications mapping
        ├── ResumeMatchingServiceImpl.java
        ├── InterviewServiceImpl.java     # NEW — schedule, postpone, queue mgmt
        ├── MockTestServiceImpl.java      # NEW — start, submit, score, category detection
        ├── OtpServiceImpl.java
        ├── EmailServiceImpl.java
        └── SmsServiceImpl.java

frontend/                                   # React Frontend (Vite + TypeScript)
├── vite.config.ts                          # Vite config with /api proxy
├── package.json
├── src/
│   ├── main.tsx                            # Entry point
│   ├── App.tsx                             # Routes & providers (+ interview, mock test routes)
│   ├── index.css                           # Global styles
│   ├── types/index.ts                      # TypeScript interfaces (+ Interview, MockTest types)
│   ├── context/AuthContext.tsx              # JWT auth state management
│   ├── components/
│   │   ├── Layout.tsx                      # Navbar + role-based nav links (+ My Interviews)
│   │   └── ProtectedRoute.tsx              # Route guard (auth + role check)
│   ├── services/
│   │   ├── api.ts                          # Axios instance + JWT interceptor
│   │   └── endpoints.ts                    # All API calls (+ interview, mock test endpoints)
│   └── pages/
│       ├── auth/
│       │   ├── LoginPage.tsx               # Email + password login
│       │   ├── VerifyOtpPage.tsx           # OTP verification → JWT
│       │   └── RegisterPage.tsx            # Candidate self-registration
│       ├── super-admin/
│       │   ├── SACompaniesPage.tsx          # CRUD companies (with cascade delete)
│       │   └── SACoosPage.tsx              # Create & list COOs
│       ├── coo/
│       │   ├── CooCompaniesPage.tsx        # Enlist companies
│       │   └── CooHrsPage.tsx              # Onboard HRs (with company picker)
│       ├── hr/
│       │   ├── HrJobsPage.tsx             # Post jobs (+ qualifications), view jobs
│       │   ├── HrApplicationsPage.tsx      # View & update status + schedule interviews
│       │   ├── HrMatchPage.tsx            # Trigger AI resume matching
│       │   └── HrSelectedPage.tsx          # View full details of selected candidates
│       ├── candidate/
│       │   ├── CandidateProfilePage.tsx    # Create/edit profile + salary expectations
│       │   ├── CandidateJobsPage.tsx       # Browse & apply (+ view qualifications)
│       │   ├── CandidateApplicationsPage.tsx # Track statuses + take mock tests
│       │   ├── CandidateInterviewsPage.tsx # NEW — View & postpone interviews
│       │   └── CandidateMockTestPage.tsx   # NEW — Take mock test & view results
│       └── UnauthorizedPage.tsx            # 403 access denied
```

---

## Prerequisites

Before running the application, ensure you have:

- **Java 21** (JDK) — [Download](https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html)
- **Node.js 22+** — [Download](https://nodejs.org/) (for React frontend)
- **PostgreSQL 14+** — [Download](https://www.postgresql.org/download/)
- **Git** — [Download](https://git-scm.com/)
- **Gmail Account** with App Password (for email OTP) — [Guide](https://support.google.com/accounts/answer/185833)
- **Twilio Account** (optional, for SMS OTP) — [Sign Up Free](https://www.twilio.com/try-twilio)
- **Python ML Engine** (optional, for AI resume matching) — External service running on port 8000

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/sameerdighe28/recruitment-management-service.git
cd recruitment-management-service
```

### 2. Create PostgreSQL Database

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create the database
CREATE DATABASE cris;

-- Verify
\l
```

### 3. Configure Application Properties

Edit `src/main/resources/application.properties`:

```properties
# ============================
# PostgreSQL (REQUIRED)
# ============================
spring.datasource.url=jdbc:postgresql://localhost:5432/cris
spring.datasource.username=postgres
spring.datasource.password=your_postgres_password

# ============================
# Email OTP - Gmail SMTP (REQUIRED for email OTP)
# ============================
spring.mail.username=your-actual-email@gmail.com
spring.mail.password=your-16-char-app-password

# ============================
# SMS OTP - Twilio (OPTIONAL)
# ============================
twilio.account-sid=your-twilio-sid
twilio.auth-token=your-twilio-token
twilio.phone-number=+1234567890
twilio.enabled=false          # Set to true to enable SMS

# ============================
# JWT Secret (RECOMMENDED to change)
# ============================
app.jwt.secret=your-base64-encoded-secret-key
app.jwt.expiration-ms=86400000    # 24 hours

# ============================
# Default Super Admin
# ============================
app.admin.email=admin@recruitment.com
app.admin.password=Admin@123
app.admin.mobile=+1234567890
app.admin.name=Super Admin

# ============================
# Python ML Resume Matching Engine (OPTIONAL)
# ============================
# The ML engine must expose: POST /match (multipart: job_description, job_skills, files)
app.ml-engine.base-url=http://127.0.0.1:8000
```

#### 📧 How to Get Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to **App Passwords**
4. Select **Mail** → **Other (Custom name)** → Enter "Recruitment Service"
5. Copy the 16-character password into `spring.mail.password`

#### 📱 How to Get Twilio Credentials (Optional)

1. Sign up at [Twilio](https://www.twilio.com/try-twilio)
2. Get your **Account SID** and **Auth Token** from the dashboard
3. Get a phone number from **Phone Numbers** → **Manage** → **Buy a Number**
4. Set `twilio.enabled=true` in properties

> **Note:** With `twilio.enabled=false` (default), OTPs are logged to the console instead of being sent via SMS. Email OTP sending has a similar fallback if SMTP is not configured.

### 4. Build the Application

```bash
./gradlew clean build
```

### 5. Run the Application

```bash
./gradlew bootRun
```

The application will start on **http://localhost:8080**.

### 6. Install & Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The React app will start on **http://localhost:5173** with API proxy to the backend.

> **Note:** The Vite dev server proxies all `/api/*` requests to `http://localhost:8080` automatically — no CORS issues during development.

---

## Running the Application

### Using Gradle

```bash
# Build backend
./gradlew clean build

# Run backend
./gradlew bootRun

# Run tests
./gradlew test
```

### Using Frontend (React + Vite)

```bash
# Install dependencies (first time only)
cd frontend && npm install

# Development server (with hot reload)
npm run dev          # → http://localhost:5173

# Production build
npm run build        # → outputs to frontend/dist/
```

### Using JAR

```bash
# Build JAR
./gradlew clean build

# Run JAR
java -jar build/libs/recruitment-management-service-0.0.1-SNAPSHOT.jar
```

### Verify Application is Running

```bash
curl -s http://localhost:8080/api/auth/login | jq .
# Should return 400 (expected — no body provided)
```

---

## Default Credentials

On first startup, a default **Super Admin** account is automatically created:

| Field | Value |
|---|---|
| Email | `admin@recruitment.com` |
| Password | `Admin@123` |
| Mobile | `+1234567890` |
| Role | `SUPER_ADMIN` |

> ⚠️ **Change these in production** by updating `app.admin.*` properties before first run.

Additionally, **100 mock test questions** (20 per category) are seeded automatically on first startup.

---

## Sample API Requests

### 1a. Login — Admin/HR/COO (OTP flow)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@recruitment.com",
    "password": "Admin@123"
  }'
```

**Response (OTP sent):**
```json
{
  "message": "OTP has been sent to your email and mobile number",
  "email": "admin@recruitment.com",
  "maskedMobile": "****7890"
}
```

### 1b. Login — Candidate (Direct JWT, no OTP)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@example.com",
    "password": "Candidate@123"
  }'
```

**Response (JWT directly):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "role": "CANDIDATE",
  "email": "candidate@example.com"
}
```

### 2. Verify OTP (Non-candidate roles only)

> Check your email or console logs for the 6-digit OTP

```bash
curl -X POST http://localhost:8080/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@recruitment.com",
    "otp": "123456"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "role": "SUPER_ADMIN",
  "email": "admin@recruitment.com"
}
```

### 3. Create a Company (Super Admin)

```bash
curl -X POST http://localhost:8080/api/super-admin/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "name": "TechCorp Solutions",
    "address": "123 Tech Street, Bangalore",
    "website": "https://techcorp.com"
  }'
```

### 4. Delete a Company (Super Admin — Cascade)

```bash
curl -X DELETE http://localhost:8080/api/super-admin/companies/<company-uuid> \
  -H "Authorization: Bearer <your-jwt-token>"
```

> **Note:** This cascade-deletes all job applications for jobs in the company, all jobs, and nullifies the company reference for associated COO/HR users.

### 5. Post a Job with Qualifications (HR)

```bash
curl -X POST http://localhost:8080/api/hr/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <hr-jwt-token>" \
  -d '{
    "title": "Senior Java Developer",
    "description": "Looking for experienced Java developer with Spring Boot expertise",
    "skillset": ["Java", "Spring Boot", "PostgreSQL", "Docker"],
    "requiredQualifications": ["Bachelor'\''s degree in CS or related field", "3+ years Java experience", "Strong Spring Boot skills"],
    "preferredQualifications": ["Master'\''s degree", "Cloud experience (AWS/GCP)", "Leadership experience"],
    "category": "TECHNICAL",
    "location": "Bangalore",
    "salaryMin": 6.0,
    "salaryMax": 10.0
  }'
```

### 6. Schedule an Interview (HR)

```bash
curl -X POST http://localhost:8080/api/hr/applications/<application-uuid>/schedule-interview \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <hr-jwt-token>" \
  -d '{
    "scheduledAt": "2026-05-01T10:00:00"
  }'
```

> **Note:** The application must be in `INTERVIEWING` status. Only one interview can be scheduled per application.

### 7. View My Interviews (Candidate)

```bash
curl -X GET http://localhost:8080/api/candidate/interviews \
  -H "Authorization: Bearer <candidate-jwt-token>"
```

### 8. Postpone an Interview (Candidate)

```bash
curl -X PUT http://localhost:8080/api/candidate/interviews/<interview-uuid>/postpone \
  -H "Authorization: Bearer <candidate-jwt-token>"
```

> **Note:** Maximum 2 postponements allowed. When postponed, the next candidate in the queue gets the interview slot, and the postponing candidate moves to the end of the queue.

### 9. Start a Mock Test (Candidate)

```bash
curl -X POST http://localhost:8080/api/candidate/applications/<application-uuid>/mock-test/start \
  -H "Authorization: Bearer <candidate-jwt-token>"
```

**Response:**
```json
{
  "attemptId": "uuid",
  "category": "BACKEND_DEVELOPER",
  "totalQuestions": 10,
  "questions": [
    {
      "id": "uuid",
      "questionText": "What is REST?",
      "optionA": "A sleep mode",
      "optionB": "Representational State Transfer",
      "optionC": "Remote Execution System",
      "optionD": "Real-time Event Stream"
    }
  ]
}
```

> **Note:** The mock test category is auto-determined from the job title keywords. Each candidate can take one test per application. 10 questions are randomly selected from the category pool.

### 10. Submit a Mock Test (Candidate)

```bash
curl -X POST http://localhost:8080/api/candidate/mock-test/<attempt-uuid>/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <candidate-jwt-token>" \
  -d '{
    "answers": {
      "<question-uuid-1>": "B",
      "<question-uuid-2>": "A",
      "<question-uuid-3>": "C"
    }
  }'
```

**Response:**
```json
{
  "attemptId": "uuid",
  "jobApplicationId": "uuid",
  "category": "BACKEND_DEVELOPER",
  "score": 7,
  "totalQuestions": 10,
  "completed": true,
  "completedAt": "2026-04-24T15:30:00"
}
```

### 11. Update Application Status (HR)

```bash
curl -X PUT http://localhost:8080/api/hr/applications/<application-uuid>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <hr-jwt-token>" \
  -d '{
    "status": "SHORTLISTED"
  }'
```

> **Valid status transitions:**
> - `APPLIED` → `SHORTLISTED` or `REJECTED`
> - `SHORTLISTED` → `INTERVIEWING` or `REJECTED`
> - `INTERVIEWING` → `SELECTED` or `REJECTED`
> - `SELECTED` / `REJECTED` → terminal (no further changes)

### 12. Get Selected Candidate Details (HR)

```bash
curl -X GET http://localhost:8080/api/hr/jobs/<job-uuid>/selected-candidates \
  -H "Authorization: Bearer <hr-jwt-token>"
```

---

## Database Schema

### Entity Relationship

```
┌──────────┐     ┌───────────┐     ┌──────────┐
│  Company  │◄────│   User    │────►│ OtpToken │
└──────────┘     └───────────┘     └──────────┘
     │                │
     │                │ (HR posts)
     ▼                ▼
┌──────────┐    ┌──────────────────┐
│   Job    │◄───│ CandidateProfile │
└──────────┘    └──────────────────┘
     │                │
     └────┐    ┌──────┘
          ▼    ▼
    ┌────────────────┐
    │ JobApplication  │
    └────────────────┘
          │
     ┌────┴────┐
     ▼         ▼
┌──────────┐ ┌────────────────┐
│Interview │ │MockTestAttempt │
└──────────┘ └────────────────┘

┌────────────────┐     ┌──────────────┐
│InterviewQueue  │     │ MockQuestion  │
│  (per Job)     │     │ (question DB) │
└────────────────┘     └──────────────┘
```

### Tables

| Table | Description |
|---|---|
| `users` | All users (Super Admin, COO, HR, Candidate) |
| `companies` | Enlisted companies |
| `jobs` | Job postings with category and optional salary range |
| `job_skillsets` | Skills for each job (ElementCollection) |
| `job_required_qualifications` | Required qualifications per job (ElementCollection) |
| `job_preferred_qualifications` | Preferred qualifications per job (ElementCollection) |
| `candidate_profiles` | Candidate profiles with category and optional expected salary range |
| `candidate_skills` | Skills for each candidate (ElementCollection) |
| `job_applications` | Applications linking candidates to jobs |
| `otp_tokens` | OTP tokens for two-factor authentication |
| `interviews` | Scheduled interviews with status and postpone count |
| `interview_queue` | Queue ordering for interview scheduling per job |
| `mock_questions` | MCQ question bank (5 categories, 20 questions each) |
| `mock_test_attempts` | Candidate test attempts with scores |

### Mock Test Categories

| Category | Keyword Detection (from job title) |
|---|---|
| `BACKEND_DEVELOPER` | backend, java, spring, node, python, server |
| `FRONTEND_DEVELOPER` | frontend, react, angular, vue, ui, html, css |
| `MARKETING` | marketing, seo, content, digital |
| `SALESMAN` | sales, business development, account |
| `DESIGNER` | design, graphic, ux, creative |

> Default: TECHNICAL jobs → BACKEND_DEVELOPER, NON_TECHNICAL jobs → MARKETING

---

## Troubleshooting

### ❌ Database Connection Error

```
Failed to configure a DataSource: 'url' attribute is not specified
```

**Fix:** Ensure PostgreSQL is running and the database `cris` exists:
```bash
psql -U postgres -c "CREATE DATABASE cris;"
```

### ❌ Email Sending Fails

```
Failed to send OTP email
```

**Fix:** The OTP will be logged to the console as a fallback. Check application logs:
```
FALLBACK - OTP for user@email.com: 123456
```

### ❌ JWT Token Expired

```json
{ "status": 401, "message": "Unauthorized: Full authentication is required" }
```

**Fix:** Login again to get a fresh JWT token (tokens expire after 24 hours).

### ❌ Access Denied (403)

```json
{ "status": 403, "message": "Access denied" }
```

**Fix:** Ensure your JWT token belongs to the correct role for the endpoint you're accessing.

### ❌ Interview Already Scheduled

```json
{ "status": 400, "message": "Interview already scheduled for this application" }
```

**Fix:** Each application can only have one interview scheduled. Check existing interviews first.

### ❌ Maximum Postponements Reached

```json
{ "status": 400, "message": "Maximum postponement limit (2) reached" }
```

**Fix:** Candidates can postpone a maximum of 2 times per interview. No further postponements allowed.

### ❌ Mock Test Already Taken

```json
{ "status": 400, "message": "You have already taken the mock test for this application" }
```

**Fix:** Each candidate can take only one mock test per application. Use the result endpoint to view your score.

### ❌ Invalid Status Transition

```json
{ "status": 400, "message": "Application in APPLIED status can only be moved to SHORTLISTED or REJECTED" }
```

**Fix:** Follow the valid status transition flow: `APPLIED → SHORTLISTED → INTERVIEWING → SELECTED/REJECTED`.

### ❌ Invalid Salary Range

```json
{ "status": 400, "message": "Minimum salary cannot be greater than maximum salary" }
```

**Fix:** Ensure `salaryMin ≤ salaryMax`. Both fields must be provided together or both omitted.

### ❌ ML Engine Connection Failed

```json
{ "status": 400, "message": "Failed to connect to resume matching engine. Please try again later." }
```

**Fix:** Ensure the Python ML engine is running on the configured URL (default: `http://127.0.0.1:8000`). The ML engine must expose a `POST /match` endpoint accepting multipart form-data (`job_description`, `job_skills`, `files`). Update `app.ml-engine.base-url` in `application.properties` if running on a different host/port. Also verify that candidate resume URLs are accessible and downloadable.

---

## License

This project is developed for internal recruitment management purposes.

