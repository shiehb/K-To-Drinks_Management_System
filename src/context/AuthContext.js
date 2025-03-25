// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Initialize axios defaults
  useEffect(() => {
    const tokens = JSON.parse(localStorage.getItem('authTokens'));
    if (tokens?.access) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
    }
  }, []);

  // Load user on initial render
  useEffect(() => {
    async function loadUser() {
      const tokens = JSON.parse(localStorage.getItem('authTokens'));
      if (tokens?.access) {
        try {
          // Verify token and get user data
          const response = await axios.get(`${API_URL}/api/user/`);
          setUser(response.data);
        } catch (err) {
          if (err.response?.status === 401) {
            // Token expired, try to refresh
            try {
              await refreshToken();
              const newResponse = await axios.get(`${API_URL}/api/user/`);
              setUser(newResponse.data);
            } catch (refreshError) {
              console.error('Refresh failed:', refreshError);
              localStorage.removeItem('authTokens');
            }
          } else {
            console.error('User load failed:', err);
            localStorage.removeItem('authTokens');
          }
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/api/token/`, credentials);
      localStorage.setItem('authTokens', JSON.stringify(response.data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      
      // Fetch user data after successful login
      const userResponse = await axios.get(`${API_URL}/api/user/`);
      setUser(userResponse.data);
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('authTokens');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
  };

  const refreshToken = async () => {
    const tokens = JSON.parse(localStorage.getItem('authTokens'));
    if (!tokens?.refresh) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await axios.post(`${API_URL}/api/token/refresh/`, {
        refresh: tokens.refresh
      });
      
      const newTokens = {
        ...tokens,
        access: response.data.access
      };
      
      localStorage.setItem('authTokens', JSON.stringify(newTokens));
      axios.defaults.headers.common['Authorization'] = `Bearer ${newTokens.access}`;
      return newTokens;
    } catch (err) {
      console.error('Refresh token error:', err);
      logout();
      throw err;
    }
  };

  // Add axios response interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const tokens = await refreshToken();
            originalRequest.headers.Authorization = `Bearer ${tokens.access}`;
            return axios(originalRequest);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}