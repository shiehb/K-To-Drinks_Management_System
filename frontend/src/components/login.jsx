"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "../context/AuthContext"
import "../css/login.css"
import Loader from "./styled-components/Loader"
import { validateLoginInput } from "../utils/validators" // We'll create this utility
import { AlertCircle, RefreshCw, WifiOff } from "lucide-react"

export default function Login({ connectionStatus, onRetryConnection, checkingConnection }) {
  const [error, setError] = useState("")
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const { login, user, darkMode, toggleDarkMode } = useAuth()
  const navigate = useNavigate()
  const loginAttemptTimeoutRef = useRef(null)

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard")
    }

    // Check for saved username
    const savedUsername = localStorage.getItem("rememberedUsername")
    if (savedUsername) {
      setCredentials((prev) => ({ ...prev, username: savedUsername }))
      setRememberMe(true)
    }

    // Clean up timeout on unmount
    return () => {
      if (loginAttemptTimeoutRef.current) {
        clearTimeout(loginAttemptTimeoutRef.current)
      }
    }
  }, [user, navigate])

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials({ ...credentials, [name]: value })

    // Clear validation errors when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // If disconnected, attempt to reconnect first
    if (connectionStatus === "disconnected") {
      onRetryConnection()
      return
    }

    setError("")

    // Validate inputs
    const { isValid, errors } = validateLoginInput(credentials)
    if (!isValid) {
      setValidationErrors(errors)
      return
    }

    setLoading(true)

    // Set a timeout to hide the loader after 15 seconds
    loginAttemptTimeoutRef.current = setTimeout(() => {
      setLoading(false)
      setError("Login process is taking longer than expected. Please try again.")
    }, 15000)

    try {
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedUsername", credentials.username)
      } else {
        localStorage.removeItem("rememberedUsername")
      }

      const success = await login(credentials)

      if (success) {
        // Redirect to dashboard on success
        setTimeout(() => {
          navigate("/dashboard", { replace: true })
        }, 100)
      } else {
        // Show error message on failure
        setError("Invalid username or password")
        // Only clear password field
        setCredentials((prev) => ({ ...prev, password: "" }))
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.")
    } finally {
      clearTimeout(loginAttemptTimeoutRef.current)
      setLoading(false)
    }
  }

  // Toggle password visibility
  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  // Render connection status message
  const renderConnectionStatus = () => {
    if (connectionStatus === "disconnected") {
      return (
        <div className="connection-status-banner disconnected">
          <WifiOff size={20} />
          <span>Server connection unavailable</span>
          <button onClick={onRetryConnection} disabled={checkingConnection} className="retry-connection-btn">
            {checkingConnection ? (
              <>
                <RefreshCw size={16} className="spin-animation" />
                Connecting...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Retry Connection
              </>
            )}
          </button>
        </div>
      )
    }
    return null
  }

  return (
    <>
      {/* Full-screen loader */}
      {loading && (
        <div className="loader-overlay">
          <Loader />
        </div>
      )}

      {/* Login Container */}
      <div className="login-wrapper">
        {/* Connection status banner */}
        {renderConnectionStatus()}

        {/* Dark mode toggle */}
        <button
          className="theme-toggle-btn"
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          <i className={`fas fa-${darkMode ? "sun" : "moon"}`}></i>
        </button>

        {/* Error message */}
        {error && (
          <div className="error-message" role="alert">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="login-container">
          {/* Left Section */}
          <div className="login-left">
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
            {/* Login Form */}
            <form className="login-form" onSubmit={handleSubmit}>
              {/* Welcome Message */}
              <h1>Welcome Back</h1>
              <p>Login to your account to continue</p>

              {/* Username field */}
              <div className="input-group">
                <label htmlFor="username" className="labels">
                  Username
                </label>
                <div className="input-with-icon">
                  <i className="fas fa-user input-icon"></i>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    className={`inputs ${validationErrors.username ? "error-input" : ""}`}
                    placeholder="Enter your username"
                    required
                    autoComplete="username"
                    aria-invalid={!!validationErrors.username}
                    aria-describedby={validationErrors.username ? "username-error" : undefined}
                    disabled={connectionStatus === "disconnected"}
                  />
                </div>
                {validationErrors.username && (
                  <p id="username-error" className="error-text">
                    {validationErrors.username}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="input-group">
                <label htmlFor="password" className="labels">
                  Password
                </label>
                <div className="input-with-icon">
                  <i className="fas fa-lock input-icon"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    className={`inputs ${validationErrors.password ? "error-input" : ""}`}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    aria-invalid={!!validationErrors.password}
                    aria-describedby={validationErrors.password ? "password-error" : undefined}
                    disabled={connectionStatus === "disconnected"}
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={toggleShowPassword}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    role="button"
                    tabIndex="0"
                    onKeyDown={(e) => e.key === "Enter" && toggleShowPassword()}
                  >
                    {showPassword ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
                  </span>
                </div>
                {validationErrors.password && (
                  <p id="password-error" className="error-text">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {/* Remember me checkbox */}
              <div className="remember-me">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    id="remember-me"
                    disabled={connectionStatus === "disconnected"}
                  />
                  <span className="checkmark"></span>
                  Remember me
                </label>
              </div>

              {/* Login button */}
              <button
                type="submit"
                className={`button ${connectionStatus === "disconnected" ? "reconnect-button" : ""}`}
                disabled={loading}
              >
                {loading ? "LOGGING IN..." : connectionStatus === "disconnected" ? "RECONNECT TO SERVER" : "LOGIN"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

