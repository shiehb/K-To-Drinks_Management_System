/**
 * Enhanced utility functions for handling API errors consistently across the application
 */

import { toast } from "react-toastify"

// Standard toast configuration
const toastConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  style: {
    backgroundColor: "#fffbfc",
    color: "#333333",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
}

/**
 * Handle API errors with appropriate user feedback
 * @param {Error} error - The error object from the API call
 * @param {string} fallbackMessage - Fallback message if error doesn't have a response
 * @param {boolean} showToast - Whether to show a toast notification
 * @returns {Object} Formatted error object with message and field errors
 */
export const handleApiError = (error, fallbackMessage = "An error occurred", showToast = true) => {
  // Log error to console in development only
  if (process.env.NODE_ENV !== "production") {
    console.error("API Error:", error)
  }

  // Extract error details
  const statusCode = error.response?.status
  const responseData = error.response?.data

  // Format the error message
  let errorMessage = fallbackMessage
  let fieldErrors = {}

  if (responseData) {
    // Handle different error formats
    if (responseData.message) {
      errorMessage = responseData.message
    } else if (responseData.detail) {
      errorMessage = responseData.detail
    } else if (responseData.error) {
      errorMessage = typeof responseData.error === "string" ? responseData.error : "An error occurred"
    } else if (typeof responseData === "string") {
      errorMessage = responseData
    }

    // Extract field-specific errors
    if (responseData.errors) {
      fieldErrors = responseData.errors
    } else if (responseData.fields) {
      fieldErrors = responseData.fields
    } else if (responseData.fieldErrors) {
      fieldErrors = responseData.fieldErrors
    }
  }

  // Handle specific status codes
  if (statusCode === 401) {
    errorMessage = "Your session has expired. Please log in again."
    // Redirect to login page after a short delay
    setTimeout(() => {
      window.location.href = "/"
    }, 2000)
  } else if (statusCode === 403) {
    errorMessage = "You don't have permission to perform this action."
  } else if (statusCode === 404) {
    errorMessage = "The requested resource was not found."
  } else if (statusCode === 422 || statusCode === 400) {
    errorMessage = "Please check your input and try again."
  } else if (statusCode >= 500) {
    errorMessage = "Server error. Please try again later."
  } else if (error.code === "ECONNABORTED") {
    errorMessage = "Request timed out. Please check your connection and try again."
  } else if (error.message && error.message.includes("Network Error")) {
    errorMessage = "Network error. Please check your internet connection."
  }

  // Show toast notification if requested
  if (showToast) {
    toast.error(errorMessage, toastConfig)
  }

  // Return formatted error object
  return {
    message: errorMessage,
    fieldErrors,
    statusCode,
    originalError: process.env.NODE_ENV !== "production" ? error : undefined,
  }
}

/**
 * Format validation errors from the backend to work with Formik
 * @param {Object} errors - Backend validation errors object
 * @returns {Object} Formik-compatible errors object
 */
export const formatValidationErrors = (errors) => {
  const formattedErrors = {}

  if (!errors) return formattedErrors

  // Convert snake_case to camelCase and flatten nested errors
  Object.entries(errors).forEach(([field, messages]) => {
    // Convert snake_case to camelCase
    const camelField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase())

    // Handle array of error messages
    if (Array.isArray(messages)) {
      formattedErrors[camelField] = messages[0]
    }
    // Handle nested error objects
    else if (typeof messages === "object" && messages !== null) {
      Object.entries(messages).forEach(([nestedField, nestedMessages]) => {
        const fullField = `${camelField}.${nestedField}`
        formattedErrors[fullField] = Array.isArray(nestedMessages) ? nestedMessages[0] : nestedMessages
      })
    }
    // Handle string error message
    else {
      formattedErrors[camelField] = messages
    }
  })

  return formattedErrors
}

/**
 * Handle successful API responses with appropriate user feedback
 * @param {string} message - Success message to display
 * @param {boolean} showToast - Whether to show a toast notification
 */
export const handleApiSuccess = (message, showToast = true) => {
  if (showToast) {
    toast.success(message, toastConfig)
  }
}

/**
 * Create a global error boundary for handling unexpected errors
 * @param {Error} error - The error that was caught
 * @param {string} componentStack - The component stack trace
 */
export const logErrorToService = (error, componentStack) => {
  // In a real app, you would send this to an error tracking service like Sentry
  if (process.env.NODE_ENV !== "production") {
    console.error("Application Error:", error)
    console.error("Component Stack:", componentStack)
  }

  // You could implement actual error logging service here
  // Example: Sentry.captureException(error, { extra: { componentStack } })
}

/**
 * Retry a failed API call with exponential backoff
 * @param {Function} apiCall - The API call function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} - The result of the API call
 */
export const retryApiCall = async (apiCall, maxRetries = 3, baseDelay = 1000) => {
  let lastError

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall()
    } catch (error) {
      lastError = error

      // Don't retry for certain status codes
      if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 422) {
        throw error
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt)

      // Wait before next retry
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError
}

