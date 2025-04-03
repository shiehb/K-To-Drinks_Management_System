/**
 * Secure storage utility to replace direct localStorage usage
 * This provides an abstraction layer that can be enhanced with encryption
 * or replaced with more secure storage mechanisms in the future
 */

// Simple encryption function (not for high-security needs)
const encrypt = (text) => {
  // In a real app, use a proper encryption library
  // This is a simple obfuscation for demonstration
  return btoa(text)
}

// Simple decryption function
const decrypt = (encryptedText) => {
  try {
    return atob(encryptedText)
  } catch (e) {
    return null
  }
}

// Storage prefix to avoid collisions
const PREFIX = "ktd_secure_"

export const secureStorage = {
  // Get item from storage
  getItem: (key) => {
    try {
      const encryptedValue = localStorage.getItem(`${PREFIX}${key}`)
      if (!encryptedValue) return null
      return decrypt(encryptedValue)
    } catch (error) {
      console.error("Error retrieving from secure storage:", error)
      return null
    }
  },

  // Set item in storage
  setItem: (key, value) => {
    try {
      const encryptedValue = encrypt(value)
      localStorage.setItem(`${PREFIX}${key}`, encryptedValue)
      return true
    } catch (error) {
      console.error("Error saving to secure storage:", error)
      return false
    }
  },

  // Remove item from storage
  removeItem: (key) => {
    try {
      localStorage.removeItem(`${PREFIX}${key}`)
      return true
    } catch (error) {
      console.error("Error removing from secure storage:", error)
      return false
    }
  },

  // Clear all secure storage items
  clear: () => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(PREFIX)) {
          localStorage.removeItem(key)
        }
      })
      return true
    } catch (error) {
      console.error("Error clearing secure storage:", error)
      return false
    }
  },
}

export default secureStorage

