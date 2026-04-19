// ── Auth ──
export interface LoginRequest {
  email: string;
  password: string;
}

export interface OtpVerificationRequest {
  email: string;
  otp: string;
}

export interface RegisterUserRequest {
  email: string;
  password: string;
  fullName: string;
  mobileNumber: string;
  role: string;
}

export interface OtpSentResponse {
  message: string;
  email: string;
  maskedMobile: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  role: string;
  email: string;
}

// ── Company ──
export interface CreateCompanyRequest {
  name: string;
  address?: string;
  website?: string;
}

export interface CompanyResponse {
  id: string;
  name: string;
  address: string;
  website: string;
}

// ── User ──
export interface CreateHrRequest {
  email: string;
  password: string;
  fullName: string;
  mobileNumber: string;
  companyId: string;
}

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  role: string;
  companyName: string;
}

// ── Job ──
export interface PostJobRequest {
  title: string;
  description: string;
  skillset: string[];
  category: 'TECHNICAL' | 'NON_TECHNICAL';
  location?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
}

export interface JobResponse {
  id: string;
  title: string;
  description: string;
  skillset: string[];
  category: string;
  location: string;
  companyName: string;
  postedBy: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryRange: string | null;
}

// ── Candidate ──
export interface CandidateProfileRequest {
  category: 'TECHNICAL' | 'NON_TECHNICAL';
  skills: string[];
  experienceYears: number;
  expectedSalaryMin?: number | null;
  expectedSalaryMax?: number | null;
}

export interface CandidateProfileResponse {
  id: string;
  category: string;
  skills: string[];
  resumeUrl: string;
  experienceYears: number;
  candidateName: string;
  candidateEmail: string;
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  expectedSalaryRange: string | null;
}

// ── Job Application ──
export interface JobApplicationResponse {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  status: string;
  candidateName: string;
  candidateEmail: string;
  appliedAt: string;
}

export interface UpdateApplicationStatusRequest {
  status: 'APPLIED' | 'SHORTLISTED' | 'INTERVIEWING' | 'SELECTED' | 'REJECTED';
}

// ── Resume Matching ──
export interface ResumeMatchResponse {
  jobId: string;
  jobTitle: string;
  jobRole: string;
  matchedCandidates: MatchedCandidate[];
  bestCandidate: MatchedCandidate | null;
}

export interface MatchedCandidate {
  candidateProfileId: string;
  candidateName: string;
  candidateEmail: string;
  skills: string[];
  experienceYears: number;
  matchScore: number;
  resumeUrl: string;
}

// ── Selected Candidate ──
export interface SelectedCandidateDetailResponse {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  status: string;
  candidateProfileId: string;
  candidateName: string;
  candidateEmail: string;
  candidateMobile: string;
  category: string;
  skills: string[];
  experienceYears: number;
  resumeUrl: string;
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  expectedSalaryRange: string | null;
}

// ── Error ──
export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  message: string;
  path: string;
}

export interface MessageResponse {
  message: string;
}
