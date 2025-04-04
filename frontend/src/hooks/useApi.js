"use client"

// Optimize API hooks with caching and debouncing
import { useState, useEffect, useCallback, useRef } from "react"
import api from "../api/api_url"

/**
 * Enhanced custom hook for making API requests with caching and debouncing
 * @param {string} url - The API endpoint to fetch from
 * @param {Object} options - Additional options for the API request
 * @returns {Object} - The loading state, error state, data, and refetch function
 */
export function useApi(url, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const cache = useRef({})
  const requestTimeoutRef = useRef(null)

  // Add caching options
  const {
    cacheDuration = 60000, // 1 minute cache by default
    cacheKey = url,
    debounceTime = 300, // 300ms debounce by default
    autoFetch = true,
  } = options

  const fetchData = useCallback(
    async (overrideOptions = {}) => {
      try {
        // Clear any pending request timeout
        if (requestTimeoutRef.current) {
          clearTimeout(requestTimeoutRef.current)
        }

        // Return a new Promise that resolves after the debounce time
        return new Promise((resolve) => {
          requestTimeoutRef.current = setTimeout(async () => {
            try {
              setLoading(true)
              setError(null)

              // Check cache first
              const now = Date.now()
              if (
                cache.current[cacheKey] &&
                now - cache.current[cacheKey].timestamp < cacheDuration &&
                !overrideOptions.forceRefresh
              ) {
                setData(cache.current[cacheKey].data)
                setLoading(false)
                resolve(cache.current[cacheKey].data)
                return
              }

              const mergedOptions = { ...options, ...overrideOptions }
              const response = await api(url, mergedOptions)

              // Update cache
              cache.current[cacheKey] = {
                data: response.data,
                timestamp: now,
              }

              setData(response.data)
              setLoading(false)
              resolve(response.data)
            } catch (err) {
              const errorMessage = err.response?.data?.message || err.message || "An error occurred"
              setError(errorMessage)
              setLoading(false)
              resolve(null)
            }
          }, debounceTime)
        })
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "An error occurred"
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [url, options, cacheKey, cacheDuration, debounceTime],
  )

  // Clear cache when component unmounts
  useEffect(() => {
    return () => {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // Only auto-fetch if autoFetch is true
    if (autoFetch) {
      fetchData()
    }
  }, [fetchData, autoFetch])

  // Enhanced refetch function with force refresh option
  const refetch = useCallback(
    (overrideOptions = {}) => {
      return fetchData({ ...overrideOptions, forceRefresh: true })
    },
    [fetchData],
  )

  return {
    data,
    loading,
    error,
    refetch,
    // Add cache control functions
    clearCache: () => {
      cache.current[cacheKey] = null
    },
    invalidateCache: () => {
      cache.current = {}
    },
  }
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

