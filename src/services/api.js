// src/services/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/token/refresh/`, { refresh: refreshToken });
        localStorage.setItem('accessToken', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (error) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

// Add dashboard API methods
export const dashboardAPI = {
  getDashboardData: () => api.get('/dashboard/'),
};

// Auth API methods
export const authAPI = {
    // ... other methods ...
    getUserProfile: async () => {
      try {
        // First try the /users/me/ endpoint
        const response = await api.get('/users/me/');
        return response;
      } catch (error) {
        if (error.response?.status === 404) {
          // Fallback to alternative endpoint if /me/ doesn't exist
          const fallbackResponse = await api.get('/users/current/');
          return fallbackResponse;
        }
        throw error;
      }
    },
  };

export default api;