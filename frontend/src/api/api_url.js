// api/api_url.js
import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle token refresh if 401 error
    if (error.response?.status === 401 && !error.config._retry) {
      try {
        error.config._retry = true;
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken) {
          const response = await axios.post(`${import.meta.env.VITE_API_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          if (response.data.access) {
            localStorage.setItem("token", response.data.access);
            api.defaults.headers.Authorization = `Bearer ${response.data.access}`;
            return api(error.config);
          }
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;