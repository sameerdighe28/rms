import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/endpoints';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const roleDashboard: Record<string, string> = {
  ROLE_SUPER_ADMIN: '/super-admin/companies',
  ROLE_COO: '/coo/companies',
  ROLE_HR: '/hr/jobs',
  ROLE_CANDIDATE: '/candidate/profile',
};

export default function VerifyOtpPage() {
  const location = useLocation();
  const email = (location.state as any)?.email || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({ email, otp });
      const role = res.data.role.startsWith('ROLE_') ? res.data.role : `ROLE_${res.data.role}`;
      login(res.data.token, role, res.data.email);
      toast.success('Login successful!');
      navigate(roleDashboard[role] || '/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    navigate('/login');
    return null;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">🔐 Verify OTP</h1>
        <p className="auth-subtitle">OTP sent to <strong>{email}</strong>. Check your email or console logs.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Enter OTP</label>
            <input className="form-control" type="text" value={otp} maxLength={6}
              onChange={e => setOtp(e.target.value)} required placeholder="6-digit OTP" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

