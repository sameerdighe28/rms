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
export interface CreateCooRequest {
  email: string;
  password: string;
  fullName: string;
  mobileNumber: string;
  companyId: string;
}

export interface CreateHrRequest {
  email: string;
  password: string;
  fullName: string;
  mobileNumber: string;
  companyId?: string;
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
  requiredQualifications?: string[];
  preferredQualifications?: string[];
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
  requiredQualifications: string[];
  preferredQualifications: string[];
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

// ── AI Job Description Generation ──
export interface GenerateJdResponse {
  job_title: string;
  summary: string;
  responsibilities: string[];
  required_qualifications: string[];
  preferred_qualifications: string[];
  bias_check: {
    bias_found: boolean;
    suggestions: string[];
  };
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

// ── Interview ──
export interface InterviewResponse {
  id: string;
  jobApplicationId: string;
  jobTitle: string;
  companyName: string;
  candidateName: string;
  candidateEmail: string;
  scheduledAt: string;
  status: string;
  postponeCount: number;
  createdAt: string;
}

export interface ScheduleInterviewRequest {
  scheduledAt: string;
}

// ── Mock Test ──
export interface MockQuestionDTO {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

export interface MockTestStartResponse {
  attemptId: string;
  category: string;
  totalQuestions: number;
  questions: MockQuestionDTO[];
}

export interface MockTestSubmitRequest {
  answers: Record<string, string>;
}

export interface MockTestResultResponse {
  attemptId: string;
  jobApplicationId: string;
  category: string;
  score: number;
  totalQuestions: number;
  completed: boolean;
  completedAt: string | null;
}

