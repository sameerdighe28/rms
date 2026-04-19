import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/endpoints';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', fullName: '', mobileNumber: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.registerCandidate({ ...form, role: 'CANDIDATE' });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">📝 Candidate Registration</h1>
        <p className="auth-subtitle">Create your account to start applying</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input className="form-control" value={form.fullName}
              onChange={e => update('fullName', e.target.value)} required placeholder="Alice Candidate" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" value={form.email}
              onChange={e => update('email', e.target.value)} required placeholder="candidate@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" value={form.password}
              onChange={e => update('password', e.target.value)} required placeholder="••••••••" />
          </div>
          <div className="form-group">
            <label>Mobile Number</label>
            <input className="form-control" value={form.mobileNumber}
              onChange={e => update('mobileNumber', e.target.value)} required placeholder="+1234567893" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="text-center mt-16">
          Already have an account? <Link to="/login" className="link">Login</Link>
        </p>
      </div>
    </div>
  );
}

