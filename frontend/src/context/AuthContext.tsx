import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthUser {
  token: string;
  role: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (token: string, role: string, email: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    if (token && role && email) {
      setUser({ token, role, email });
    }
  }, []);

  const login = (token: string, role: string, email: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('email', email);
    setUser({ token, role, email });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

