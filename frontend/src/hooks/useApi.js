"use client"

import { useState, useEffect, useCallback } from "react"
import api from "../api/api_url"

/**
 * Custom hook for making API requests with loading, error, and data states
 * @param {string} url - The API endpoint to fetch from
 * @param {Object} options - Additional options for the API request
 * @returns {Object} - The loading state, error state, data, and refetch function
 */
export function useApi(url, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(
    async (overrideOptions = {}) => {
      try {
        setLoading(true)
        setError(null)

        const mergedOptions = { ...options, ...overrideOptions }
        const response = await api(url, mergedOptions)

        setData(response.data)
        return response.data
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "An error occurred"
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [url, options],
  )

  useEffect(() => {
    // Only auto-fetch if autoFetch is not explicitly set to false
    if (options.autoFetch !== false) {
      fetchData()
    }
  }, [fetchData, options.autoFetch])

  return { data, loading, error, refetch: fetchData }
}

/**
 * Custom hook for making POST requests to the API
 * @param {string} url - The API endpoint to post to
 * @param {Object} options - Additional options for the API request
 * @returns {Object} - The submit function, loading state, and error state
 */
export function useApiMutation(url, options = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const submit = useCallback(
    async (payload, overrideOptions = {}) => {
      try {
        setLoading(true)
        setError(null)

        const method = options.method || "post"
        const mergedOptions = {
          ...options,
          ...overrideOptions,
          method,
          data: payload,
        }

        const response = await api(url, mergedOptions)
        setData(response.data)
        return response.data
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "An error occurred"
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [url, options],
  )

  return { submit, loading, error, data }
}

