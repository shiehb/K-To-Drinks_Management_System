import axios from "axios"

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const tokenData = localStorage.getItem("token")
    if (tokenData) {
      try {
        const { token, expires } = JSON.parse(tokenData)

        // Only include token if it's not expired
        if (Date.now() < expires) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (error) {
        console.error("Error parsing token data:", error)
        // Remove invalid token data
        localStorage.removeItem("token")
      }
    }

    // Add CSRF protection for non-GET requests
    if (config.method !== "get") {
      config.headers["X-Requested-With"] = "XMLHttpRequest"
    }

    // Implement request deduplication for GET requests
    if (config.method === "get") {
      const requestKey = `${config.url}`
      const currentTime = Date.now()
      const lastRequestTime = api.requestCache?.[requestKey] || 0

      // If the same request was made in the last 2 seconds, abort this one
      if (currentTime - lastRequestTime < 2000) {
        const controller = new AbortController()
        config.signal = controller.signal
        controller.abort("Duplicate request aborted")
      } else {
        // Update the request cache
        if (!api.requestCache) api.requestCache = {}
        api.requestCache[requestKey] = currentTime
      }
    }

    // Only log in development
    if (process.env.NODE_ENV === "development") {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config)
    }

    return config
  },
  (error) => {
    console.error("API Request Error:", error)
    return Promise.reject(error)
  },
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data)
    return response
  },
  async (error) => {
    console.error("API Response Error:", error.response?.status, error.response?.data)

    // Handle token refresh if 401 error
    if (error.response?.status === 401 && !error.config._retry) {
      try {
        error.config._retry = true
        const refreshToken = localStorage.getItem("refreshToken")

        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/token/refresh/`,
            {
              refresh: refreshToken,
            },
          )

          if (response.data.access) {
            localStorage.setItem("token", response.data.access)
            api.defaults.headers.Authorization = `Bearer ${response.data.access}`
            return api(error.config)
          }
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
        window.location.href = "/"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default api

