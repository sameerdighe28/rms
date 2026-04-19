import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/endpoints';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const roleDashboard: Record<string, string> = {
  ROLE_SUPER_ADMIN: '/super-admin/companies',
  ROLE_COO: '/coo/companies',
  ROLE_HR: '/hr/jobs',
  ROLE_CANDIDATE: '/candidate/profile',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const data = res.data;

      // If response contains 'token', it's a direct login (Candidate — no OTP)
      if ('token' in data && data.token) {
        const authData = data as { token: string; role: string; email: string };
        const role = authData.role.startsWith('ROLE_') ? authData.role : `ROLE_${authData.role}`;
        login(authData.token, role, authData.email);
        toast.success('Login successful!');
        navigate(roleDashboard[role] || '/');
      } else {
        // OTP flow for other roles
        const otpData = data as { message: string };
        toast.success(otpData.message);
        navigate('/verify-otp', { state: { email } });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">🏢 RMS Login</h1>
        <p className="auth-subtitle">Enter your credentials to continue</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" value={email}
              onChange={e => setEmail(e.target.value)} required placeholder="admin@recruitment.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" value={password}
              onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center mt-16">
          Candidate? <Link to="/register" className="link">Register here</Link>
        </p>
      </div>
    </div>
  );
}

