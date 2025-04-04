"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "../context/AuthContext"
import "../css/login.css"
import Loader from "./styled-components/Loader"
import { toast } from "react-toastify"
import { Eye, EyeOff, User, Lock, AlertCircle } from "lucide-react"

export default function Login() {
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, user, darkMode, toggleDarkMode } = useAuth()
  const navigate = useNavigate()
  const usernameRef = useRef(null)
  const passwordRef = useRef(null)

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard")
    }
  }, [user, navigate])

  // Focus on username field on component mount
  useEffect(() => {
    if (usernameRef.current) {
      usernameRef.current.focus()
    }
  }, [])

  // Validate form inputs
  const validateForm = () => {
    const newErrors = {}

    if (!credentials.username.trim()) {
      newErrors.username = "Username is required"
    }

    if (!credentials.password.trim()) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials({ ...credentials, [name]: value })

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    // Set a timeout to hide the loader after 15 seconds
    const loaderTimeout = setTimeout(() => {
      setLoading(false)
      toast.error("Login process is taking longer than expected. Please try again.")
    }, 15000)

    try {
      // Sanitize inputs to prevent XSS
      const sanitizedCredentials = {
        username: credentials.username.trim(),
        password: credentials.password,
      }

      const success = await login(sanitizedCredentials)

      if (success) {
        toast.success("Login successful! Redirecting to dashboard...")
        // Redirect to dashboard on success
        setTimeout(() => {
          navigate("/dashboard", { replace: true })
        }, 100)
      } else {
        // Show error message on failure
        toast.error("Invalid username or password")
        // Only clear password field
        setCredentials((prev) => ({ ...prev, password: "" }))
        if (passwordRef.current) {
          passwordRef.current.focus()
        }
      }
    } catch (err) {
      console.error("Login error:", err)
      toast.error("An error occurred during login. Please try again.")
    } finally {
      clearTimeout(loaderTimeout)
      setLoading(false)
    }
  }

  // Toggle password visibility
  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e)
    }
  }

  return (
    <>
      {/* Full-screen loader */}
      {loading && (
        <div className="loader-overlay" role="alert" aria-live="assertive" aria-busy="true">
          <Loader />
          <p className="loading-text">Please wait...</p>
        </div>
      )}

      {/* Login Container */}
      <div className="login-wrapper">
        {/* Dark mode toggle with improved accessibility */}
        <button
          className="theme-toggle-btn"
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={darkMode}
        >
          <i className={`fas fa-${darkMode ? "sun" : "moon"}`} aria-hidden="true"></i>
        </button>

        <div className="login-container">
          {/* Left Section */}
          <div className="login-left" aria-hidden="true">
            {" "}
            {/* Mark as decorative for screen readers */}
            <div className="login-image">
              <div className="overlay"></div>
              <div className="login-title">
                <div className="login-title-top">K-TO-DRINKS</div>
                <div className="login-title-bottom">TRADING</div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="login-right">
            {/* Login Form with improved accessibility */}
            <form className="login-form" onSubmit={handleSubmit} aria-labelledby="login-heading">
              {/* Welcome Message */}
              <h1 id="login-heading">Welcome Back</h1>
              <p>Login to your account to continue</p>

              {/* Username field */}
              <div className="input-group">
                <label htmlFor="username" className="labels" id="username-label">
                  Username
                </label>
                <div className="input-with-icon">
                  <User className="input-icon" aria-hidden="true" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    className={`inputs ${errors.username ? "input-error" : ""}`}
                    placeholder="Enter your username"
                    required
                    autoComplete="username"
                    ref={usernameRef}
                    onKeyDown={handleKeyDown}
                    aria-invalid={errors.username ? "true" : "false"}
                    aria-describedby={errors.username ? "username-error" : undefined}
                    aria-labelledby="username-label"
                  />
                </div>
                {errors.username && (
                  <div className="error-message-inline" id="username-error" role="alert">
                    <AlertCircle size={16} aria-hidden="true" />
                    <span>{errors.username}</span>
                  </div>
                )}
              </div>

              {/* Password field with improved accessibility */}
              <div className="input-group">
                <label htmlFor="password" className="labels" id="password-label">
                  Password
                </label>
                <div className="input-with-icon">
                  <Lock className="input-icon" aria-hidden="true" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    className={`inputs ${errors.password ? "input-error" : ""}`}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    ref={passwordRef}
                    onKeyDown={handleKeyDown}
                    aria-invalid={errors.password ? "true" : "false"}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    aria-labelledby="password-label"
                  />
                  <button
                    type="button"
                    className="password-toggle-icon"
                    onClick={toggleShowPassword}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                  </button>
                </div>
                {errors.password && (
                  <div className="error-message-inline" id="password-error" role="alert">
                    <AlertCircle size={16} aria-hidden="true" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              {/* Login button with improved accessibility */}
              <button type="submit" className="button" disabled={loading} aria-busy={loading} aria-disabled={loading}>
                {loading ? "LOGGING IN..." : "LOGIN"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

