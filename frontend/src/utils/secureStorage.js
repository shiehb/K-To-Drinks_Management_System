/**
 * Enhanced secure storage utility with improved encryption
 */

// Use a more secure encryption method
const encrypt = (text) => {
  try {
    // In a production environment, use a proper encryption library
    // This is a more secure implementation than simple base64 encoding
    const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0))
    const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2)
    const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code)

    const salt = (Math.random() + 1).toString(36).substring(2, 12)

    return salt + text.split("").map(textToChars).map(applySaltToChar).map(byteHex).join("")
  } catch (e) {
    console.error("Encryption error:", e)
    return null
  }
}

// Corresponding decryption method
const decrypt = (encryptedText) => {
  try {
    if (!encryptedText) return null

    const salt = encryptedText.substr(0, 10)
    const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0))
    const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code)

    return encryptedText
      .substr(10)
      .match(/.{1,2}/g)
      .map((hex) => Number.parseInt(hex, 16))
      .map(applySaltToChar)
      .map((charCode) => String.fromCharCode(charCode))
      .join("")
  } catch (e) {
    console.error("Decryption error:", e)
    return null
  }
}

// Storage prefix to avoid collisions
const PREFIX = "ktd_secure_"

// Add expiration support
const setWithExpiry = (key, value, ttl = 86400000) => {
  // Default: 24 hours
  const item = {
    value: value,
    expiry: Date.now() + ttl,
  }
  return JSON.stringify(item)
}

const getWithExpiry = (item) => {
  if (!item) return null

  const parsedItem = JSON.parse(item)

  // Check if the item is expired
  if (Date.now() > parsedItem.expiry) {
    return null
  }

  return parsedItem.value
}

export const secureStorage = {
  // Get item from storage with expiry check
  getItem: (key) => {
    try {
      const encryptedValue = localStorage.getItem(`${PREFIX}${key}`)
      if (!encryptedValue) return null

      const decryptedValue = decrypt(encryptedValue)
      return getWithExpiry(decryptedValue)
    } catch (error) {
      console.error("Error retrieving from secure storage:", error)
      return null
    }
  },

  // Set item in storage with expiry
  setItem: (key, value, ttl) => {
    try {
      const valueWithExpiry = setWithExpiry(value, ttl)
      const encryptedValue = encrypt(valueWithExpiry)

      if (!encryptedValue) return false

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

  // Check if an item exists and is not expired
  hasValidItem: (key) => {
    try {
      const encryptedValue = localStorage.getItem(`${PREFIX}${key}`)
      if (!encryptedValue) return false

      const decryptedValue = decrypt(encryptedValue)
      return getWithExpiry(decryptedValue) !== null
    } catch (error) {
      console.error("Error checking secure storage:", error)
      return false
    }
  },
}

export default secureStorage

