import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks: Record<string, { label: string; to: string }[]> = {
  ROLE_SUPER_ADMIN: [
    { label: 'Companies', to: '/super-admin/companies' },
    { label: 'COOs', to: '/super-admin/coos' },
  ],
  ROLE_COO: [
    { label: 'Companies', to: '/coo/companies' },
    { label: 'HR Users', to: '/coo/hrs' },
  ],
  ROLE_HR: [
    { label: 'My Jobs', to: '/hr/jobs' },
  ],
  ROLE_CANDIDATE: [
    { label: 'My Profile', to: '/candidate/profile' },
    { label: 'Browse Jobs', to: '/candidate/jobs' },
    { label: 'My Applications', to: '/candidate/applications' },
    { label: 'My Interviews', to: '/candidate/interviews' },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user ? navLinks[user.role] || [] : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/">🏢 RMS</Link>
        </div>
        <div className="navbar-links">
          {links.map((l) => (
            <Link key={l.to} to={l.to}>{l.label}</Link>
          ))}
        </div>
        <div className="navbar-right">
          {user && (
            <>
              <span className="navbar-user">{user.email} ({user.role.replace('ROLE_', '')})</span>
              <button onClick={handleLogout} className="btn btn-sm btn-outline">Logout</button>
            </>
          )}
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

