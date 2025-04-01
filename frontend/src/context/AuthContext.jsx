"use client"

import { useState, createContext, useContext, useEffect } from "react"
import api from "../api/api_url"
import { toast } from "react-toastify"

export const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [darkMode, setDarkMode] = useState(() => {
    // Check if user has a preference stored in localStorage
    const savedMode = localStorage.getItem("darkMode")
    return savedMode === "true"
  })

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark")
    } else {
      document.body.classList.remove("dark")
    }
    // Save preference to localStorage
    localStorage.setItem("darkMode", darkMode)
  }, [darkMode])

  // Toggle dark mode function
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode)
  }

  // Check if user is already logged in on component mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Fix the checkAuth function to prevent infinite loops
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        // Don't update state if there's no token
        return false
      }

      // Decode token to get basic user info
      const userData = parseJwt(token)

      // Only update user state if it's different from current state
      if (userData && (!user || user.username !== (userData.username || userData.sub))) {
        setUser({
          username: userData.username || userData.sub,
          firstName: userData.first_name || "",
          lastName: userData.last_name || "",
          role: userData.role || "employee",
        })
      }

      return !!userData
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      return false
    }
  }

  // Parse JWT token
  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1]
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      )
      return JSON.parse(jsonPayload)
    } catch (e) {
      console.error("Error parsing JWT:", e)
      return null
    }
  }

  // Fix the login function to properly handle authentication and user data
  const login = async (credentials) => {
    setLoading(true)
    setError(null)

    try {
      // Get token
      const response = await api.post("/token/", credentials)

      if (response.data && response.data.access) {
        // Store tokens
        localStorage.setItem("access_token", response.data.access)
        localStorage.setItem("refresh_token", response.data.refresh)

        // Get user data from token
        const userData = parseJwt(response.data.access)

        if (userData) {
          // Set user state with complete information
          setUser({
            username: userData.username || userData.sub,
            firstName: userData.first_name || "",
            lastName: userData.last_name || "",
            role: userData.role || "employee",
            email: userData.email || "",
          })

          // Try to get additional user info if available
          try {
            const userResponse = await api.get("/users/me/")
            if (userResponse.data) {
              setUser((prevUser) => ({
                ...prevUser,
                firstName: userResponse.data.first_name || prevUser.firstName,
                lastName: userResponse.data.last_name || prevUser.lastName,
                email: userResponse.data.email || prevUser.email,
              }))
            }
          } catch (userError) {
            console.log("Could not fetch additional user data:", userError)
            // Continue with the basic user info from token
          }

          // Log successful authentication
          console.log("Authentication successful:", userData)
          toast.success("Login successful")
          return true
        }
      }

      throw new Error("Invalid response from server")
    } catch (error) {
      console.error("Login error:", error)
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message || "Login failed"
      setError(errorMsg)
      toast.error(errorMsg)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    toast.info("Logged out successfully")
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    checkAuth,
    darkMode,
    toggleDarkMode,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Export as default as well for backward compatibility
export default AuthProvider

