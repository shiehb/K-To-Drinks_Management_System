/**
 * Enhanced input validation utilities with stronger security checks
 */

// Improved sanitization function to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input

  // More comprehensive sanitization
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\(/g, "&#040;")
    .replace(/\)/g, "&#041;")
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;")
    .replace(/=/g, "&#061;")
    .replace(/-/g, "&#045;")
    .replace(/\+/g, "&#043;")
    .replace(/\$/g, "&#036;")
    .replace(/\//g, "&#047;")
    .replace(/\\/g, "&#092;")
}

// Enhanced login validation with stronger password requirements
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
  } else if (!/^[a-zA-Z0-9_]+$/.test(credentials.username)) {
    errors.username = "Username can only contain letters, numbers, and underscores"
    isValid = false
  }

  // Validate password with stronger requirements
  if (!credentials.password) {
    errors.password = "Password is required"
    isValid = false
  } else if (credentials.password.length < 8) {
    errors.password = "Password must be at least 8 characters"
    isValid = false
  }

  // Check for common security issues
  if (credentials.username && credentials.password) {
    // Check for SQL injection patterns
    const sqlInjectionPattern =
      /('|"|;|--|\/\*|\*\/|xp_|sp_|exec|select|insert|update|delete|drop|union|into|load_file|outfile)/i
    if (sqlInjectionPattern.test(credentials.username) || sqlInjectionPattern.test(credentials.password)) {
      errors.username = "Invalid characters detected"
      isValid = false
    }

    // Check for XSS patterns
    const xssPattern = /(<|>|script|iframe|onerror|onload|eval|javascript:)/i
    if (xssPattern.test(credentials.username) || xssPattern.test(credentials.password)) {
      errors.username = "Invalid characters detected"
      isValid = false
    }
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

// Enhanced store form validation
export const validateStoreForm = (storeData) => {
  const errors = {}
  let isValid = true

  // Validate name with improved security
  if (!storeData.name) {
    errors.name = "Store name is required"
    isValid = false
  } else if (storeData.name.length > 100) {
    errors.name = "Store name must be less than 100 characters"
    isValid = false
  } else if (/<[^>]*>/.test(storeData.name)) {
    errors.name = "Store name contains invalid characters"
    isValid = false
  }

  // Validate location
  if (!storeData.location) {
    errors.location = "Location is required"
    isValid = false
  } else if (storeData.location.length > 255) {
    errors.location = "Location must be less than 255 characters"
    isValid = false
  }

  // Validate owner name
  if (!storeData.owner_name) {
    errors.owner_name = "Owner name is required"
    isValid = false
  } else if (storeData.owner_name.length > 100) {
    errors.owner_name = "Owner name must be less than 100 characters"
    isValid = false
  } else if (/<[^>]*>/.test(storeData.owner_name)) {
    errors.owner_name = "Owner name contains invalid characters"
    isValid = false
  }

  // Validate contact number with improved pattern
  if (!storeData.number) {
    errors.number = "Contact number is required"
    isValid = false
  } else {
    // More comprehensive phone validation
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/
    if (!phoneRegex.test(storeData.number)) {
      errors.number = "Please enter a valid phone number"
      isValid = false
    }
  }

  // Validate email if provided with improved pattern
  if (storeData.email) {
    // More comprehensive email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(storeData.email)) {
      errors.email = "Please enter a valid email address"
      isValid = false
    }
  }

  // Validate coordinates
  if (isNaN(storeData.lat) || isNaN(storeData.lng)) {
    errors.coordinates = "Valid coordinates are required"
    isValid = false
  } else {
    // Check if coordinates are within valid range
    if (storeData.lat < -90 || storeData.lat > 90) {
      errors.coordinates = "Latitude must be between -90 and 90"
      isValid = false
    }
    if (storeData.lng < -180 || storeData.lng > 180) {
      errors.coordinates = "Longitude must be between -180 and 180"
      isValid = false
    }
  }

  return { isValid, errors }
}

// Add CSRF token validation
export const validateCSRFToken = (token) => {
  if (!token) return false

  // Check if token has valid format (typically a long random string)
  return /^[a-zA-Z0-9_-]{20,}$/.test(token)
}

// Add function to validate file uploads
export const validateFileUpload = (file, allowedTypes = [], maxSizeMB = 5) => {
  const errors = {}
  let isValid = true

  if (!file) {
    errors.file = "No file selected"
    return { isValid: false, errors }
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.file = `File type not allowed. Accepted types: ${allowedTypes.join(", ")}`
    isValid = false
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    errors.file = `File size exceeds the maximum allowed size of ${maxSizeMB}MB`
    isValid = false
  }

  return { isValid, errors }
}

