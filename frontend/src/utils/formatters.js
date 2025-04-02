/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: PHP)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = "PHP") => {
  if (amount === null || amount === undefined) return ""

  const formatter = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  })

  return formatter.format(amount)
}

/**
 * Format a date string
 * @param {string} dateString - The date string to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return ""

  const date = new Date(dateString)

  // Check if date is valid
  if (isNaN(date.getTime())) return dateString

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }

  const formatter = new Intl.DateTimeFormat("en-US", { ...defaultOptions, ...options })

  return formatter.format(date)
}

/**
 * Format a date and time string
 * @param {string} dateTimeString - The date and time string to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return ""

  const date = new Date(dateTimeString)

  // Check if date is valid
  if (isNaN(date.getTime())) return dateTimeString

  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }

  const formatter = new Intl.DateTimeFormat("en-US", options)

  return formatter.format(date)
}

/**
 * Format a number with commas
 * @param {number} number - The number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined) return ""

  return number.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format a phone number
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return ""

  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, "")

  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  } else if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return `+63 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  } else if (cleaned.length === 12 && cleaned.startsWith("63")) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
  }

  // Return original if no formatting applied
  return phoneNumber
}

