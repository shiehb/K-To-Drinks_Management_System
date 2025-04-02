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

      const result = await authService.login(credentials)

      if (result.success) {
        const { access, refresh, user: userData } = result.data

        // Store tokens in localStorage
        localStorage.setItem("token", access)
        localStorage.setItem("refreshToken", refresh)

        // Set user state
        setUser(userData)

        handleApiSuccess("Login successful")
        return true
      } else {
        setError(result.error.message)
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred during login")
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
  }

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      setLoading(true)

      const token = localStorage.getItem("token")
      if (!token) {
        return false
      }

      // Verify token
      const verifyResult = await authService.verifyToken(token)

      if (!verifyResult.success) {
        // Try to refresh the token
        const refreshToken = localStorage.getItem("refreshToken")
        if (!refreshToken) {
          return false
        }

        const refreshResult = await authService.refreshToken(refreshToken)

        if (!refreshResult.success) {
          return false
        }

        // Update token in localStorage
        localStorage.setItem("token", refreshResult.data.access)
      }

      // Fetch user profile
      const profileResult = await userService.getProfile()

      if (profileResult.success) {
        setUser(profileResult.data)
        return true
      }

      return false
    } catch (error) {
      console.error("Auth check error:", error)
      return false
    } finally {
      setLoading(false)
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
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext

