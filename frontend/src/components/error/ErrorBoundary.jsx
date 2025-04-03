"use client"

import { Component } from "react"
import { logErrorToService } from "../../utils/apiErrorHandler"

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    logErrorToService(error, errorInfo.componentStack)
    this.setState({ errorInfo })
  }

  handleRefresh = () => {
    // Reload the current page
    window.location.reload()
  }

  handleGoHome = () => {
    // Navigate to home page
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="error-boundary" role="alert" aria-live="assertive">
          <div className="error-container">
            <div className="error-icon">
              <span className="material-icons" aria-hidden="true">
                error_outline
              </span>
            </div>
            <h2>Something went wrong</h2>
            <p>We're sorry, but an unexpected error occurred.</p>

            {process.env.NODE_ENV !== "production" && this.state.error && (
              <div className="error-details">
                <h3>Error Details:</h3>
                <p className="error-message">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <details>
                    <summary>Component Stack</summary>
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  </details>
                )}
              </div>
            )}

            <div className="error-actions">
              <button onClick={this.handleRefresh} className="refresh-button" aria-label="Refresh page">
                <span className="material-icons" aria-hidden="true">
                  refresh
                </span>
                Refresh Page
              </button>
              <button onClick={this.handleGoHome} className="home-button" aria-label="Go to home page">
                <span className="material-icons" aria-hidden="true">
                  home
                </span>
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    // If no error, render children normally
    return this.props.children
  }
}

export default ErrorBoundary

