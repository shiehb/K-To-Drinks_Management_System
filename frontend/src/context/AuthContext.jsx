"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authService, userService } from "../services/api"
import { handleApiSuccess } from "../utils/apiErrorHandler"
import { toast } from "react-toastify"
import { secureStorage } from "../utils/secureStorage" // We'll create this utility

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
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage or system preference
    const savedMode = localStorage.getItem("darkMode")
    if (savedMode !== null) {
      return savedMode === "true"
    }
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode
      localStorage.setItem("darkMode", newMode.toString())
      document.documentElement.classList.toggle("dark", newMode)
      return newMode
    })
  }

  // Initialize auth state from secureStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = secureStorage.getItem("token")
        if (token) {
          const result = await checkAuth()
          if (!result) {
            // If token verification fails, clear storage
            secureStorage.removeItem("token")
            secureStorage.removeItem("refreshToken")
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    // Set dark mode class on document
    document.documentElement.classList.toggle("dark", darkMode)

    initAuth()
  }, [darkMode])

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true)
      setError(null)

      const result = await authService.login(credentials)

      if (result.success) {
        const { access, refresh, user: userData } = result.data

        // Store tokens in secureStorage
        secureStorage.setItem("token", access)
        secureStorage.setItem("refreshToken", refresh)

        // Set user state
        setUser(userData)

        handleApiSuccess("Login successful")
        return true
      } else {
        setError(result.error.message)
        return false
      }
    } catch (error) {
      setError("An unexpected error occurred during login")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    // Clear storage
    secureStorage.removeItem("token")
    secureStorage.removeItem("refreshToken")

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

      const token = secureStorage.getItem("token")
      if (!token) {
        return false
      }

      // Verify token
      const verifyResult = await authService.verifyToken(token)

      if (!verifyResult.success) {
        // Try to refresh the token
        const refreshToken = secureStorage.getItem("refreshToken")
        if (!refreshToken) {
          return false
        }

        const refreshResult = await authService.refreshToken(refreshToken)

        if (!refreshResult.success) {
          return false
        }

        // Update token in secureStorage
        secureStorage.setItem("token", refreshResult.data.access)
      }

      // Fetch user profile
      const profileResult = await userService.getProfile()

      if (profileResult.success) {
        setUser(profileResult.data)
        return true
      }

      return false
    } catch (error) {
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

