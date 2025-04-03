"use client"

import { useState, useEffect } from "react"
import { checkApiConnection } from "../utils/apiUtils"
import { API_URL } from "../config/environment"

export default function ApiStatusIndicator() {
  const [status, setStatus] = useState("checking")
  const [apiUrl, setApiUrl] = useState("")

  useEffect(() => {
    // Only show the actual API URL in development
    setApiUrl(import.meta.env.DEV ? API_URL : "API")

    const checkConnection = async () => {
      const isConnected = await checkApiConnection()
      setStatus(isConnected ? "connected" : "disconnected")
    }

    checkConnection()

    // Periodically check connection in development
    let interval
    if (import.meta.env.DEV) {
      interval = setInterval(checkConnection, 30000) // Check every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

  // Only render in development mode
  if (!import.meta.env.DEV) return null

  return (
    <div
      className="api-status-indicator"
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        padding: "5px 10px",
        borderRadius: "4px",
        fontSize: "12px",
        fontFamily: "monospace",
        zIndex: 9999,
        backgroundColor: status === "connected" ? "#d4edda" : status === "disconnected" ? "#f8d7da" : "#fff3cd",
        color: status === "connected" ? "#155724" : status === "disconnected" ? "#721c24" : "#856404",
        border: `1px solid ${status === "connected" ? "#c3e6cb" : status === "disconnected" ? "#f5c6cb" : "#ffeeba"}`,
      }}
    >
      {status === "connected" ? "✓" : status === "disconnected" ? "✗" : "⟳"} {apiUrl}
    </div>
  )
}

