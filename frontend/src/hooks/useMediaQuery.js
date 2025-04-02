"use client"

import { useState, useEffect } from "react"

/**
 * Custom hook for responsive design with media queries
 * @param {string} query - CSS media query string
 * @returns {boolean} - Whether the media query matches
 */
const useMediaQuery = (query) => {
  // Initialize with the current match state
  const [matches, setMatches] = useState(() => {
    // Check if window is defined (for SSR)
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    // Check if window is defined (for SSR)
    if (typeof window === "undefined") return

    // Create media query list
    const mediaQueryList = window.matchMedia(query)

    // Define callback for media query change
    const handleChange = (event) => {
      setMatches(event.matches)
    }

    // Add event listener
    if (mediaQueryList.addEventListener) {
      // Modern browsers
      mediaQueryList.addEventListener("change", handleChange)
    } else {
      // Older browsers
      mediaQueryList.addListener(handleChange)
    }

    // Set initial value
    setMatches(mediaQueryList.matches)

    // Cleanup
    return () => {
      if (mediaQueryList.removeEventListener) {
        // Modern browsers
        mediaQueryList.removeEventListener("change", handleChange)
      } else {
        // Older browsers
        mediaQueryList.removeListener(handleChange)
      }
    }
  }, [query])

  return matches
}

// Predefined media query hooks
export const useIsMobile = () => useMediaQuery("(max-width: 767px)")
export const useIsTablet = () => useMediaQuery("(min-width: 768px) and (max-width: 1023px)")
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)")
export const useIsDarkMode = () => useMediaQuery("(prefers-color-scheme: dark)")

// Export the main hook as default
export default useMediaQuery