import axios from "axios"
import { handleApiError } from "../utils/apiErrorHandler"
import endpoints from "../config/apiEndpoints"

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://k-to-drinks-management-system.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  // Add withCredentials to properly handle CORS with credentials
  withCredentials: true,
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const tokenData = localStorage.getItem("token")
    if (tokenData) {
      try {
        // If token is stored as JSON object with expiry
        const { token } = JSON.parse(tokenData)
        config.headers.Authorization = `Bearer ${token}`
      } catch (error) {
        // If token is stored as plain string
        config.headers.Authorization = `Bearer ${tokenData}`
      }
    }

    // Add CSRF token if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")
    if (csrfToken) {
      config.headers["X-CSRF-TOKEN"] = csrfToken
    }

    return config
  },
  (error) => Promise.reject(error),
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log the error for debugging
    console.error("API Error:", error.response || error.message || error)

    // Handle token refresh if 401 error
    if (error.response?.status === 401 && !error.config._retry) {
      try {
        error.config._retry = true
        const refreshToken = localStorage.getItem("refreshToken")

        if (refreshToken) {
          // Use axios directly for refresh to avoid interceptors loop
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/token/refresh/`,
            { refresh: refreshToken },
            { withCredentials: true },
          )

          if (response.data.access) {
            // Store the new token
            localStorage.setItem(
              "token",
              JSON.stringify({
                token: response.data.access,
                expires: new Date().getTime() + 24 * 60 * 60 * 1000, // 24 hours
              }),
            )

            // Update authorization header
            api.defaults.headers.Authorization = `Bearer ${response.data.access}`

            // Retry the original request
            return api(error.config)
          }
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError)

        // If refresh fails, redirect to login
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
        window.location.href = "/"
        return Promise.reject(refreshError)
      }
    }

    // For CORS errors, provide more helpful message
    if (error.message && error.message.includes("Network Error")) {
      console.error("Possible CORS issue. Check server CORS configuration.")
    }

    return Promise.reject(error)
  },
)

// Auth service
export const authService = {
  login: async (credentials) => {
    try {
      // Use axios directly for login to avoid interceptors
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/token/`,
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      )

      return { success: true, data: response.data }
    } catch (error) {
      console.error("Login error:", error.response || error.message || error)
      return {
        success: false,
        error: handleApiError(error, "Login failed", false),
      }
    }
  },

  refreshToken: async (refreshToken) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/token/refresh/`,
        { refresh: refreshToken },
        { withCredentials: true },
      )
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error, "Token refresh failed", false),
      }
    }
  },

  verifyToken: async (token) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/token/verify/`,
        { token },
        { withCredentials: true },
      )
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error, "Token verification failed", false),
      }
    }
  },

  changePassword: async (data) => {
    try {
      const response = await api.post(endpoints.AUTH.CHANGE_PASSWORD, data)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error, "Password change failed"),
      }
    }
  },
}

// User service
export const userService = {
  getAll: async () => {
    try {
      const response = await api.get(endpoints.USER.LIST)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch users") }
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(endpoints.USER.DETAIL(id))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch user") }
    }
  },

  create: async (userData) => {
    try {
      const response = await api.post(endpoints.USER.CREATE, userData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to create user") }
    }
  },

  update: async (id, userData) => {
    try {
      const response = await api.put(endpoints.USER.UPDATE(id), userData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to update user") }
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(endpoints.USER.DELETE(id))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to delete user") }
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get(endpoints.USER.PROFILE)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch profile") }
    }
  },
}

// Delivery service
export const deliveryService = {
  getAll: async () => {
    try {
      const response = await api.get(endpoints.DELIVERY.LIST)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch deliveries") }
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(endpoints.DELIVERY.DETAIL(id))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch delivery") }
    }
  },

  updateStatus: async (id, statusData) => {
    try {
      const response = await api.post(endpoints.DELIVERY.UPDATE_STATUS(id), statusData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to update delivery status") }
    }
  },

  uploadSignature: async (id, signatureData) => {
    try {
      const response = await api.post(endpoints.DELIVERY.SIGNATURE(id), { signature: signatureData })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to upload signature") }
    }
  },

  getRoutes: async (params) => {
    try {
      const response = await api.get(endpoints.DELIVERY.ROUTES, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch delivery routes") }
    }
  },
}

// Export all services
export default {
  auth: authService,
  user: userService,
  delivery: deliveryService,
  // Other services remain the same
}

// Export the axios instance for direct use
export { api }

