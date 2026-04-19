import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/auth/LoginPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import RegisterPage from './pages/auth/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

import SACompaniesPage from './pages/super-admin/SACompaniesPage';
import SACoosPage from './pages/super-admin/SACoosPage';

import CooCompaniesPage from './pages/coo/CooCompaniesPage';
import CooHrsPage from './pages/coo/CooHrsPage';

import HrJobsPage from './pages/hr/HrJobsPage';
import HrApplicationsPage from './pages/hr/HrApplicationsPage';
import HrMatchPage from './pages/hr/HrMatchPage';
import HrSelectedPage from './pages/hr/HrSelectedPage';

import CandidateProfilePage from './pages/candidate/CandidateProfilePage';
import CandidateJobsPage from './pages/candidate/CandidateJobsPage';
import CandidateApplicationsPage from './pages/candidate/CandidateApplicationsPage';

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  const homePath = () => {
    if (!isAuthenticated || !user) return '/login';
    const map: Record<string, string> = {
      ROLE_SUPER_ADMIN: '/super-admin/companies',
      ROLE_COO: '/coo/companies',
      ROLE_HR: '/hr/jobs',
      ROLE_CANDIDATE: '/candidate/profile',
    };
    return map[user.role] || '/login';
  };

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected with Layout */}
      <Route element={<Layout />}>
        {/* Super Admin */}
        <Route path="/super-admin/companies" element={
          <ProtectedRoute roles={['ROLE_SUPER_ADMIN']}><SACompaniesPage /></ProtectedRoute>
        } />
        <Route path="/super-admin/coos" element={
          <ProtectedRoute roles={['ROLE_SUPER_ADMIN']}><SACoosPage /></ProtectedRoute>
        } />

        {/* COO */}
        <Route path="/coo/companies" element={
          <ProtectedRoute roles={['ROLE_COO']}><CooCompaniesPage /></ProtectedRoute>
        } />
        <Route path="/coo/hrs" element={
          <ProtectedRoute roles={['ROLE_COO']}><CooHrsPage /></ProtectedRoute>
        } />

        {/* HR */}
        <Route path="/hr/jobs" element={
          <ProtectedRoute roles={['ROLE_HR']}><HrJobsPage /></ProtectedRoute>
        } />
        <Route path="/hr/jobs/:jobId/applications" element={
          <ProtectedRoute roles={['ROLE_HR']}><HrApplicationsPage /></ProtectedRoute>
        } />
        <Route path="/hr/jobs/:jobId/match" element={
          <ProtectedRoute roles={['ROLE_HR']}><HrMatchPage /></ProtectedRoute>
        } />
        <Route path="/hr/jobs/:jobId/selected" element={
          <ProtectedRoute roles={['ROLE_HR']}><HrSelectedPage /></ProtectedRoute>
        } />

        {/* Candidate */}
        <Route path="/candidate/profile" element={
          <ProtectedRoute roles={['ROLE_CANDIDATE']}><CandidateProfilePage /></ProtectedRoute>
        } />
        <Route path="/candidate/jobs" element={
          <ProtectedRoute roles={['ROLE_CANDIDATE']}><CandidateJobsPage /></ProtectedRoute>
        } />
        <Route path="/candidate/applications" element={
          <ProtectedRoute roles={['ROLE_CANDIDATE']}><CandidateApplicationsPage /></ProtectedRoute>
        } />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to={homePath()} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
