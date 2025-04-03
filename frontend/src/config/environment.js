/**
 * Centralized environment configuration
 * This file provides a single place to access environment variables
 * and includes validation and fallback values
 */

// API configuration
export const API_URL = import.meta.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"

// Environment detection
export const IS_DEVELOPMENT = import.meta.env.DEV
export const IS_PRODUCTION = import.meta.env.PROD

// Application configuration
export const APP_VERSION = import.meta.env.NEXT_PUBLIC_APP_VERSION || "1.0.0"

// Validate required environment variables
export function validateEnvironment() {
  const requiredVars = ["NEXT_PUBLIC_API_URL"]
  const missing = []

  requiredVars.forEach((varName) => {
    if (!import.meta.env[varName]) {
      missing.push(varName)
    }
  })

  if (missing.length > 0 && IS_PRODUCTION) {
    console.warn(`Missing required environment variables: ${missing.join(", ")}`)
    return false
  }

  return true
}

// Log environment configuration in development
if (IS_DEVELOPMENT) {
  console.log("Environment Configuration:", {
    API_URL,
    IS_DEVELOPMENT,
    IS_PRODUCTION,
    APP_VERSION,
  })
}

