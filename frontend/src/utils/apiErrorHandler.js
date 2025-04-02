/**
 * Utility functions for handling API errors consistently across the application
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
  console.error("API Error:", error)

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
    }

    // Extract field-specific errors
    if (responseData.errors) {
      fieldErrors = responseData.errors
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
    else if (typeof messages === "object") {
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

