import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/api';

interface User {
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedUsername = localStorage.getItem('auth_username');

      if (storedToken && storedUsername) {
        setToken(storedToken);
        setUser({ username: storedUsername });

        // Verify token by calling /auth/me
        try {
          await api.get('/auth/me');
        } catch (err) {
          // If token is invalid/expired, log out
          console.error("Session token validation failed, logging out", err);
          handleLogout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Set up Axios interceptor to catch 401s and force logout
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.warn("Unauthorized API access (401), clearing session.");
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_username');
    setToken(null);
    setUser(null);
  };

  const login = async (username: string, password: string) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', { username, password });
      const { access_token, username: responseUsername } = response.data;

      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('auth_username', responseUsername);

      setToken(access_token);
      setUser({ username: responseUsername });
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : err.response?.data?.detail || 'Failed to login. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (username: string, password: string) => {
    setError(null);
    try {
      // Create user
      await api.post('/auth/register', { username, password });
      
      // Auto-login after successful registration
      await login(username, password);
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : err.response?.data?.detail || 'Registration failed. Username may already be taken.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    handleLogout();
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    register,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
