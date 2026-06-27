import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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

  // Helper to configure Axios headers
  const setAxiosAuthHeader = (jwtToken: string | null) => {
    if (jwtToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedUsername = localStorage.getItem('auth_username');

      if (storedToken && storedUsername) {
        setToken(storedToken);
        setUser({ username: storedUsername });
        setAxiosAuthHeader(storedToken);

        // Optional: Verify token by calling /api/auth/me
        try {
          await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
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

  // Set up Axios global interceptor to catch 401s and force logout
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
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
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_username');
    setToken(null);
    setUser(null);
    setAxiosAuthHeader(null);
  };

  const login = async (username: string, password: string) => {
    setError(null);
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      const { access_token, username: responseUsername } = response.data;

      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('auth_username', responseUsername);

      setToken(access_token);
      setUser({ username: responseUsername });
      setAxiosAuthHeader(access_token);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to login. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (username: string, password: string) => {
    setError(null);
    try {
      // Create user
      await axios.post('/api/auth/register', { username, password });
      
      // Auto-login after successful registration for premium UX
      await login(username, password);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed. Username may already be taken.';
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
