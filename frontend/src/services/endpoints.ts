import api from './api';
import type * as T from '../types';

// ── Auth ──
export const authApi = {
  login: (data: T.LoginRequest) => api.post<T.AuthResponse | T.OtpSentResponse>('/auth/login', data),
  verifyOtp: (data: T.OtpVerificationRequest) => api.post<T.AuthResponse>('/auth/verify-otp', data),
  registerCandidate: (data: T.RegisterUserRequest) => api.post<T.UserResponse>('/auth/register/candidate', data),
};

// ── Super Admin ──
export const superAdminApi = {
  createCompany: (data: T.CreateCompanyRequest) => api.post<T.CompanyResponse>('/super-admin/companies', data),
  deleteCompany: (id: string) => api.delete<T.MessageResponse>(`/super-admin/companies/${id}`),
  getCompanies: () => api.get<T.CompanyResponse[]>('/super-admin/companies'),
  createCoo: (data: T.CreateCooRequest) => api.post<T.UserResponse>('/super-admin/coo', data),
  getCoos: () => api.get<T.UserResponse[]>('/super-admin/coo'),
};

// ── COO ──
export const cooApi = {
  getCompanies: () => api.get<T.CompanyResponse[]>('/coo/companies'),
  createHr: (data: T.CreateHrRequest) => api.post<T.UserResponse>('/coo/hr', data),
  getHrs: () => api.get<T.UserResponse[]>('/coo/hr'),
};

// ── HR ──
export const hrApi = {
  postJob: (data: T.PostJobRequest) => api.post<T.JobResponse>('/hr/jobs', data),
  getMyJobs: () => api.get<T.JobResponse[]>('/hr/jobs'),
  getJobApplications: (jobId: string) => api.get<T.JobApplicationResponse[]>(`/hr/jobs/${jobId}/applications`),
  matchCandidates: (jobId: string) => api.post<T.ResumeMatchResponse>(`/hr/jobs/${jobId}/match-candidates`),
  updateApplicationStatus: (appId: string, data: T.UpdateApplicationStatusRequest) =>
    api.put<T.JobApplicationResponse>(`/hr/applications/${appId}/status`, data),
  getSelectedCandidates: (jobId: string) => api.get<T.SelectedCandidateDetailResponse[]>(`/hr/jobs/${jobId}/selected-candidates`),
  scheduleInterview: (appId: string, data: T.ScheduleInterviewRequest) =>
    api.post<T.InterviewResponse>(`/hr/applications/${appId}/schedule-interview`, data),
};

// ── Candidate ──
export const candidateApi = {
  createProfile: (data: T.CandidateProfileRequest, resumeFile?: File) => {
    const formData = new FormData();
    formData.append('profile', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }
    return api.post<T.CandidateProfileResponse>('/candidate/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateProfile: (data: T.CandidateProfileRequest, resumeFile?: File) => {
    const formData = new FormData();
    formData.append('profile', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }
    return api.put<T.CandidateProfileResponse>('/candidate/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getProfile: () => api.get<T.CandidateProfileResponse>('/candidate/profile'),
  getAvailableJobs: () => api.get<T.JobResponse[]>('/candidate/jobs'),
  applyToJob: (jobId: string) => api.post<T.JobApplicationResponse>(`/candidate/jobs/${jobId}/apply`),
  getMyApplications: () => api.get<T.JobApplicationResponse[]>('/candidate/applications'),
  getMyInterviews: () => api.get<T.InterviewResponse[]>('/candidate/interviews'),
  postponeInterview: (interviewId: string) => api.put<T.InterviewResponse>(`/candidate/interviews/${interviewId}/postpone`),
  startMockTest: (applicationId: string) => api.post<T.MockTestStartResponse>(`/candidate/applications/${applicationId}/mock-test/start`),
  submitMockTest: (attemptId: string, data: T.MockTestSubmitRequest) =>
    api.post<T.MockTestResultResponse>(`/candidate/mock-test/${attemptId}/submit`, data),
  getMockTestResult: (applicationId: string) => api.get<T.MockTestResultResponse>(`/candidate/applications/${applicationId}/mock-test/result`),
};
