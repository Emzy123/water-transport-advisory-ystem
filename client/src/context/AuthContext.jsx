import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AuthContext = createContext(null);
const THEME_KEY = 'wtap-theme';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const fullName = localStorage.getItem('fullName');
    const userId = localStorage.getItem('userId');
    return token ? { token, role, fullName, userId } : null;
  });

  const login = (data) => {
    const token = data.token || data.accessToken;
    localStorage.setItem('token', token);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('role', data.role);
    localStorage.setItem('fullName', data.fullName);
    localStorage.setItem('userId', String(data.userId));
    setUser({ token, role: data.role, fullName: data.fullName, userId: data.userId });
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      /* proceed with local logout */
    }
    const theme = localStorage.getItem(THEME_KEY);
    localStorage.clear();
    if (theme) localStorage.setItem(THEME_KEY, theme);
    setUser(null);
  };

  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthLogoutRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = () => {
      if (window.location.pathname !== '/login') navigate('/login');
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [navigate]);
}

export const useAuth = () => useContext(AuthContext);
