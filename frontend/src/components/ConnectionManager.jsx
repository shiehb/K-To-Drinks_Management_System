"use client"

import { useState, useEffect } from "react"
import { checkApiConnection } from "../utils/apiUtils"
import Login from "./login"
import { toast } from "react-toastify"
import Loader from "./styled-components/Loader"

/**
 * ConnectionManager component that handles backend connection status
 * and conditionally renders either the login interface or the main application
 */
const ConnectionManager = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState("checking") // "checking", "connected", "disconnected"
  const [checkingConnection, setCheckingConnection] = useState(false)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const [showMainApp, setShowMainApp] = useState(false)

  // Check connection status on component mount and periodically
  useEffect(() => {
    checkConnection()

    // Set up periodic connection checks
    const intervalId = setInterval(() => {
      if (connectionStatus === "disconnected") {
        checkConnection()
      }
    }, 30000) // Check every 30 seconds if disconnected

    return () => clearInterval(intervalId)
  }, [connectionStatus])

  // Function to check API connection
  const checkConnection = async () => {
    if (checkingConnection) return

    setCheckingConnection(true)
    try {
      const isConnected = await checkApiConnection()

      if (isConnected) {
        setConnectionStatus("connected")
        setShowMainApp(true)
        if (connectionAttempts > 0) {
          toast.success("Connection to server established!")
        }
      } else {
        setConnectionStatus("disconnected")
        setShowMainApp(false)
        if (connectionAttempts > 0) {
          toast.error("Unable to connect to server. Please try again later.")
        }
      }
    } catch (error) {
      setConnectionStatus("disconnected")
      setShowMainApp(false)
    } finally {
      setCheckingConnection(false)
      setConnectionAttempts((prev) => prev + 1)
    }
  }

  // Handle manual retry
  const handleRetryConnection = () => {
    toast.info("Attempting to reconnect...")
    checkConnection()
  }

  // If still checking initial connection, show a loader
  if (connectionStatus === "checking" && connectionAttempts === 0) {
    return (
      <div className="connection-checking-container">
        <Loader />
        <p>Checking connection to server...</p>
      </div>
    )
  }

  // If disconnected, show the login interface with connection status
  if (connectionStatus === "disconnected") {
    return (
      <Login
        connectionStatus={connectionStatus}
        onRetryConnection={handleRetryConnection}
        checkingConnection={checkingConnection}
      />
    )
  }

  // If connected, show the main application
  return children
}

export default ConnectionManager

