/**
 * Input validation utilities
 */

// Validate login credentials
export const validateLoginInput = (credentials) => {
  const errors = {}
  let isValid = true

  // Validate username
  if (!credentials.username) {
    errors.username = "Username is required"
    isValid = false
  } else if (credentials.username.trim().length < 3) {
    errors.username = "Username must be at least 3 characters"
    isValid = false
  }

  // Validate password
  if (!credentials.password) {
    errors.password = "Password is required"
    isValid = false
  } else if (credentials.password.length < 6) {
    errors.password = "Password must be at least 6 characters"
    isValid = false
  }

  return { isValid, errors }
}

// Validate user form data
export const validateUserForm = (userData) => {
  const errors = {}
  let isValid = true

  // Validate username
  if (!userData.username) {
    errors.username = "Username is required"
    isValid = false
  } else if (userData.username.trim().length < 3) {
    errors.username = "Username must be at least 3 characters"
    isValid = false
  }

  // Validate name
  if (!userData.name) {
    errors.name = "Name is required"
    isValid = false
  }

  // Validate email
  if (userData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      errors.email = "Please enter a valid email address"
      isValid = false
    }
  }

  // Validate role
  if (!userData.role) {
    errors.role = "Role is required"
    isValid = false
  }

  return { isValid, errors }
}

// Validate store form data
export const validateStoreForm = (storeData) => {
  const errors = {}
  let isValid = true

  // Validate name
  if (!storeData.name) {
    errors.name = "Store name is required"
    isValid = false
  }

  // Validate location
  if (!storeData.location) {
    errors.location = "Location is required"
    isValid = false
  }

  // Validate owner name
  if (!storeData.owner_name) {
    errors.owner_name = "Owner name is required"
    isValid = false
  }

  // Validate contact number
  if (!storeData.number) {
    errors.number = "Contact number is required"
    isValid = false
  } else {
    const phoneRegex = /^[0-9+\s-]+$/
    if (!phoneRegex.test(storeData.number)) {
      errors.number = "Please enter a valid phone number"
      isValid = false
    }
  }

  // Validate email if provided
  if (storeData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(storeData.email)) {
      errors.email = "Please enter a valid email address"
      isValid = false
    }
  }

  // Validate coordinates
  if (isNaN(storeData.lat) || isNaN(storeData.lng)) {
    errors.coordinates = "Valid coordinates are required"
    isValid = false
  }

  return { isValid, errors }
}

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

