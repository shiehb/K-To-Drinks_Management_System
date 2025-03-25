import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Your Django backend URL

const authService = {
  // Login function
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/login/`, { username, password });
      if (response.data.access) {
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        localStorage.setItem('user', JSON.stringify({
          username: response.data.username,
          firstName: response.data.first_name,
          lastName: response.data.last_name
        }));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout function
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await axios.post(`${API_URL}/token/refresh/`, { refresh: refreshToken });
      if (response.data.access) {
        localStorage.setItem('accessToken', response.data.access);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get auth header
  getAuthHeader: () => {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};

export default authService;