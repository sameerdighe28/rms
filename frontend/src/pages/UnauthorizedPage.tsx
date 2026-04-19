import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="auth-container">
      <div className="auth-card text-center">
        <h1 style={{ fontSize: '3rem', marginBottom: 8 }}>🚫</h1>
        <h2 className="auth-title">Access Denied</h2>
        <p className="auth-subtitle">You don't have permission to access this page.</p>
        <Link to="/login" className="btn btn-primary">Go to Login</Link>
      </div>
    </div>
  );
}

