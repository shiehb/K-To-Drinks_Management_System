"use client"

import { useEffect, useState } from "react"
import { API_URL } from "../config/environment"

export default function EnvChecker() {
  const [apiStatus, setApiStatus] = useState("checking")

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await fetch(`${API_URL}/health-check`)
        if (response.ok) {
          setApiStatus("connected")
        } else {
          setApiStatus("error")
        }
      } catch (error) {
        setApiStatus("error")
        console.error("API connection error:", error)
      }
    }

    checkApi()
  }, [])

  // Only show in development
  if (!import.meta.env.DEV) return null

  return (
    <div
      style={{
        padding: "10px",
        margin: "10px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        backgroundColor: "#f8f9fa",
      }}
    >
      <h3>Environment Variables Check</h3>
      <p>
        <strong>NEXT_PUBLIC_API_URL:</strong> {import.meta.env.NEXT_PUBLIC_API_URL || "Not set"}
      </p>
      <p>
        <strong>Resolved API URL:</strong> {API_URL}
      </p>
      <p>
        <strong>API Status:</strong> {apiStatus}
      </p>
      <p>
        <strong>Environment:</strong> {import.meta.env.MODE}
      </p>
    </div>
  )
}

