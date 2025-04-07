import axios from "axios"

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://k-to-drinks-management-system.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
})

// Request cache for deduplication with improved handling
api.requestCache = {}

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Improved duplicate GET request handling
    if (config.method?.toLowerCase() === "get") {
      // Skip deduplication if explicitly requested
      if (config.skipDeduplication) {
        return config
      }

      // Create a more reliable request key
      const params = config.params || {}
      const requestKey = `${config.url}?${JSON.stringify(params)}`
      const currentTime = Date.now()
      const lastRequestTime = api.requestCache[requestKey] || 0

      // Cancel if same request was made within last 2 seconds
      if (currentTime - lastRequestTime < 2000) {
        const source = axios.CancelToken.source()
        config.cancelToken = source.token
        source.cancel(`Duplicate request cancelled: ${requestKey}`)
        return config
      }

      api.requestCache[requestKey] = currentTime
    }

    // Add auth token if available
    const tokenData = localStorage.getItem("token")
    if (tokenData) {
      try {
        const { token, expires } = JSON.parse(tokenData)
        if (Date.now() < expires) {
          config.headers.Authorization = `Bearer ${token}`
        } else {
          localStorage.removeItem("token")
        }
      } catch (error) {
        console.error("Error parsing token:", error)
        localStorage.removeItem("token")
      }
    }

    // Add CSRF protection for non-GET requests
    if (config.method?.toLowerCase() !== "get") {
      config.headers["X-Requested-With"] = "XMLHttpRequest"
    }

    // Log in development
    if (import.meta.env.MODE === "development") {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config)
    }

    return config
  },
  (error) => {
    console.error("Request setup error:", error)
    return Promise.reject(error)
  },
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Clear request cache
    if (response.config.method?.toLowerCase() === "get") {
      const params = response.config.params || {}
      const requestKey = `${response.config.url}?${JSON.stringify(params)}`
      delete api.requestCache[requestKey]
    }

    // Log successful responses
    if (import.meta.env.MODE === "development") {
      console.log(`API Response: ${response.status} ${response.config.url}`, {
        status: response.status,
        data: response.data,
        headers: response.headers,
      })
    }

    return response
  },
  async (error) => {
    // Handle cancelled requests differently
    if (axios.isCancel(error)) {
      console.log("Request cancelled:", error.message)

      // Clean up cache for cancelled requests
      if (error.config?.method?.toLowerCase() === "get") {
        const params = error.config.params || {}
        const requestKey = `${error.config.url}?${JSON.stringify(params)}`
        delete api.requestCache[requestKey]
      }

      return Promise.reject({ isCancelled: true, message: error.message })
    }

    // Log error details
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      responseData: error.response?.data,
    }

    console.error("API Error:", errorDetails)

    // Handle 401 Unauthorized (token refresh)
    if (error.response?.status === 401 && !error.config._retry) {
      try {
        error.config._retry = true
        const refreshToken = localStorage.getItem("refreshToken")

        if (refreshToken) {
          const refreshResponse = await axios.post(
            `${import.meta.env.VITE_API_URL || "https://k-to-drinks-management-system.onrender.com/api"}/token/refresh/`,
            { refresh: refreshToken },
          )

          if (refreshResponse.data.access) {
            // Store new token
            const newToken = {
              token: refreshResponse.data.access,
              expires: Date.now() + 60 * 60 * 1000, // 1 hour expiration
            }
            localStorage.setItem("token", JSON.stringify(newToken))

            // Retry original request
            api.defaults.headers.Authorization = `Bearer ${refreshResponse.data.access}`
            return api(error.config)
          }
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError)
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    // Format error response consistently
    const formattedError = {
      message: error.response?.data?.message || error.response?.data?.detail || error.message || "Network Error",
      status: error.response?.status,
      code: error.code,
      config: error.config,
      isNetworkError: !error.response,
      isTimeout: error.code === "ECONNABORTED",
      data: error.response?.data,
    }

    return Promise.reject(formattedError)
  },
)

// Add helper methods
api.getWithCancel = (url, config = {}) => {
  const source = axios.CancelToken.source()
  const request = api.get(url, { ...config, cancelToken: source.token })
  return {
    request,
    cancel: source.cancel,
  }
}

// Add method to bypass deduplication
api.getWithoutDeduplication = (url, config = {}) => {
  return api.get(url, { ...config, skipDeduplication: true })
}

api.postFormData = (url, data, config = {}) => {
  const formData = new FormData()
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key])
  })
  return api.post(url, formData, {
    ...config,
    headers: {
      ...config.headers,
      "Content-Type": "multipart/form-data",
    },
  })
}

// Add method to clear request cache
api.clearRequestCache = () => {
  api.requestCache = {}
}

export default api

