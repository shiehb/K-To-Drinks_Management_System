// services/auth.js
import api from "../api/api_url";

export const login = async (credentials) => {
  try {
    const response = await api.post("/token/", credentials);
    
    if (response.data.access) {
      localStorage.setItem("token", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: {
        message: error.response?.data?.detail || "Login failed",
        status: error.response?.status
      }
    };
  }
};

export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    
    const response = await api.post("/token/refresh/", {
      refresh: refreshToken
    });
    
    if (response.data.access) {
      localStorage.setItem("token", response.data.access);
      return { success: true, data: response.data };
    }
    
    return { success: false, error: { message: "Failed to refresh token" } };
  } catch (error) {
    return { 
      success: false, 
      error: {
        message: error.response?.data?.detail || "Token refresh failed",
        status: error.response?.status
      }
    };
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    return null;
  }
};