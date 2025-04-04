"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authService, userService } from "../services/api"
import { handleApiSuccess } from "../utils/apiErrorHandler"
import { toast } from "react-toastify"

// Create context
const AuthContext = createContext()

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          const result = await checkAuth()
          if (!result) {
            // If token verification fails, clear localStorage
            localStorage.removeItem("token")
            localStorage.removeItem("refreshToken")
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true)
      setError(null)

      // Sanitize inputs to prevent XSS
      const sanitizedCredentials = {
        username: credentials.username.trim(),
        password: credentials.password,
      }

      const result = await authService.login(sanitizedCredentials)

      if (result.success) {
        const { access, refresh, user: userData } = result.data

        // Store tokens securely in localStorage with expiration
        const tokenExpiry = new Date()
        tokenExpiry.setHours(tokenExpiry.getHours() + 24) // 24 hour expiry

        const tokenData = {
          token: access,
          expires: tokenExpiry.getTime(),
        }

        localStorage.setItem("token", JSON.stringify(tokenData))
        localStorage.setItem("refreshToken", refresh)

        // Set user state with sanitized data
        setUser({
          ...userData,
          // Remove sensitive information if present
          password: undefined,
          passwordHash: undefined,
        })

        handleApiSuccess("Login successful")
        return true
      } else {
        // Handle specific error cases
        if (result.error.statusCode === 401) {
          setError("Invalid username or password")
        } else if (result.error.statusCode === 403) {
          setError("Your account has been disabled. Please contact an administrator.")
        } else if (result.error.message.includes("locked")) {
          setError("Your account has been locked due to multiple failed attempts. Please try again later.")
        } else {
          setError(result.error.message)
        }
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred during login. Please try again.")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")

    // Clear user state
    setUser(null)

    // Show success message
    toast.info("You have been logged out", {
      position: "top-right",
      autoClose: 3000,
    })

    // Redirect to login page
    window.location.href = "/"
  }

  // Optimize the checkAuth function to prevent excessive API calls
  const checkAuth = async () => {
    try {
      setLoading(true)

      // Get token from localStorage
      const tokenData = localStorage.getItem("token")
      if (!tokenData) {
        setUser(null)
        return false
      }

      // Parse token data
      const { token, expires } = JSON.parse(tokenData)

      // Add caching mechanism to prevent frequent checks
      const lastChecked = localStorage.getItem("lastAuthCheck")
      const CACHE_DURATION = 60000 // 1 minute cache

      if (lastChecked && Date.now() - Number.parseInt(lastChecked) < CACHE_DURATION) {
        setLoading(false)
        return !!user // Return current auth state without making API calls
      }

      // Check if token is expired
      if (Date.now() > expires) {
        // Try to refresh the token
        const refreshToken = localStorage.getItem("refreshToken")
        if (!refreshToken) {
          localStorage.removeItem("token")
          localStorage.removeItem("refreshToken")
          setUser(null)
          return false
        }

        const refreshResult = await authService.refreshToken(refreshToken)

        if (!refreshResult.success) {
          localStorage.removeItem("token")
          localStorage.removeItem("refreshToken")
          setUser(null)
          return false
        }

        // Update token in localStorage with new expiration
        const newTokenExpiry = new Date()
        newTokenExpiry.setHours(newTokenExpiry.getHours() + 24)

        const newTokenData = {
          token: refreshResult.data.access,
          expires: newTokenExpiry.getTime(),
        }

        localStorage.setItem("token", JSON.stringify(newTokenData))

        // Continue with verification using new token
        const result = await verifyAndGetUser(refreshResult.data.access)
        localStorage.setItem("lastAuthCheck", Date.now().toString())
        return result
      }

      // Verify token and get user
      const result = await verifyAndGetUser(token)
      localStorage.setItem("lastAuthCheck", Date.now().toString())
      return result
    } catch (error) {
      console.error("Auth check error:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Optimize verifyAndGetUser to reduce API calls
  const verifyAndGetUser = async (token) => {
    try {
      // Only verify token if we don't have a user already
      if (user) {
        return true
      }

      // Verify token
      const verifyResult = await authService.verifyToken(token)

      if (!verifyResult.success) {
        return false
      }

      // Fetch user profile
      const profileResult = await userService.getProfile()

      if (profileResult.success) {
        setUser(profileResult.data)
        return true
      }

      return false
    } catch (error) {
      console.error("Token verification error:", error)
      return false
    }
  }

  // Change password
  const changePassword = async (data) => {
    try {
      setLoading(true)

      const result = await authService.changePassword(data)

      if (result.success) {
        handleApiSuccess("Password changed successfully")
        return true
      } else {
        setError(result.error.message)
        return false
      }
    } catch (error) {
      console.error("Change password error:", error)
      setError("An unexpected error occurred")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    checkAuth,
    changePassword,
    darkMode,
    toggleDarkMode,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext

