import axios from 'axios';
import authService from '../services/auth';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000', // Your Django backend URL
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const authHeader = authService.getAuthHeader();
    if (authHeader.Authorization) {
      config.headers = {
        ...config.headers,
        ...authHeader
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await authService.refreshToken();
        const authHeader = authService.getAuthHeader();
        originalRequest.headers = {
          ...originalRequest.headers,
          ...authHeader
        };
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;