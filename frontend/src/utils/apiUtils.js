import { API_URL } from "../config/environment"

/**
 * Utility function to check if the API is accessible
 * @returns {Promise<boolean>} - True if the API is accessible, false otherwise
 */
export async function checkApiConnection() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${API_URL}/health-check`, {
      method: "GET",
      signal: controller.signal,
      // Add cache busting parameter to prevent caching
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    console.error("API connection check failed:", error)
    return false
  }
}

/**
 * Formats API errors for consistent display
 * @param {Error} error - The error object from an API request
 * @returns {Object} - Formatted error object with message and details
 */
export function formatApiError(error) {
  return {
    message: error.response?.data?.message || error.message || "An unknown error occurred",
    status: error.response?.status,
    details: error.response?.data?.details || {},
    timestamp: new Date().toISOString(),
  }
}

/**
 * Creates a full API URL for a given endpoint
 * @param {string} endpoint - The API endpoint
 * @returns {string} - The full API URL
 */
export function getFullApiUrl(endpoint) {
  const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL
  const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  return `${baseUrl}${formattedEndpoint}`
}

