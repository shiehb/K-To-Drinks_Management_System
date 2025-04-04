/**
 * Centralized configuration for API endpoints
 * This makes it easier to update endpoints across the application
 */

// Base API URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/token/`,
  REFRESH: `${API_BASE_URL}/token/refresh/`,
  VERIFY: `${API_BASE_URL}/token/verify/`,
  CHANGE_PASSWORD: `${API_BASE_URL}/users/change-password/`,
}

// User management endpoints
export const USER_ENDPOINTS = {
  LIST: `${API_BASE_URL}/users/`,
  DETAIL: (id) => `${API_BASE_URL}/users/${id}/`,
  CREATE: `${API_BASE_URL}/users/`,
  UPDATE: (id) => `${API_BASE_URL}/users/${id}/`,
  DELETE: (id) => `${API_BASE_URL}/users/${id}/`,
  PROFILE: `${API_BASE_URL}/users/profile/`,
}

// Store management endpoints
export const STORE_ENDPOINTS = {
  LIST: `${API_BASE_URL}/stores/`,
  DETAIL: (id) => `${API_BASE_URL}/stores/${id}/`,
  CREATE: `${API_BASE_URL}/stores/`,
  UPDATE: (id) => `${API_BASE_URL}/stores/${id}/`,
  ARCHIVE: (id) => `${API_BASE_URL}/stores/${id}/archive/`,
  BY_DAY: (day) => `${API_BASE_URL}/stores/?day=${day}`,
}

// Product management endpoints
export const PRODUCT_ENDPOINTS = {
  LIST: `${API_BASE_URL}/products/`,
  DETAIL: (id) => `${API_BASE_URL}/products/${id}/`,
  CREATE: `${API_BASE_URL}/products/`,
  UPDATE: (id) => `${API_BASE_URL}/products/${id}/`,
  CATEGORIES: `${API_BASE_URL}/product-categories/`,
  SUPPLIERS: `${API_BASE_URL}/suppliers/`,
}

// Inventory management endpoints
export const INVENTORY_ENDPOINTS = {
  LIST: `${API_BASE_URL}/inventory/`,
  DETAIL: (id) => `${API_BASE_URL}/inventory/${id}/`,
  ADJUST: `${API_BASE_URL}/inventory/adjust/`,
  TRANSACTIONS: `${API_BASE_URL}/inventory-transactions/`,
  LOW_STOCK: `${API_BASE_URL}/inventory/low-stock/`,
  EXPIRING: `${API_BASE_URL}/product-expiry/`,
}

// Order management endpoints
export const ORDER_ENDPOINTS = {
  LIST: `${API_BASE_URL}/orders/`,
  DETAIL: (id) => `${API_BASE_URL}/orders/${id}/`,
  CREATE: `${API_BASE_URL}/orders/`,
  UPDATE: (id) => `${API_BASE_URL}/orders/${id}/`,
  RECEIPT: (id) => `${API_BASE_URL}/orders/${id}/receipt/`,
  PDF: (id) => `${API_BASE_URL}/orders/${id}/pdf/`,
}

// Delivery management endpoints
export const DELIVERY_ENDPOINTS = {
  LIST: `${API_BASE_URL}/deliveries/`,
  DETAIL: (id) => `${API_BASE_URL}/deliveries/${id}/`,
  CREATE: `${API_BASE_URL}/deliveries/`,
  UPDATE_STATUS: (id) => `${API_BASE_URL}/deliveries/${id}/update-status/`,
  SIGNATURE: (id) => `${API_BASE_URL}/deliveries/${id}/signature/`,
  ROUTES: `${API_BASE_URL}/delivery-routes/`,
}

// Employee management endpoints
export const EMPLOYEE_ENDPOINTS = {
  LIST: `${API_BASE_URL}/employees/`,
  DETAIL: (id) => `${API_BASE_URL}/employees/${id}/`,
  CREATE: `${API_BASE_URL}/employees/`,
  UPDATE: (id) => `${API_BASE_URL}/employees/${id}/`,
  DELIVERY_STAFF: `${API_BASE_URL}/employees/?role=delivery`,
}

// Dashboard endpoints
export const DASHBOARD_ENDPOINTS = {
  SUMMARY: `${API_BASE_URL}/dashboard/summary/`,
  SALES: `${API_BASE_URL}/dashboard/sales/`,
  INVENTORY: `${API_BASE_URL}/dashboard/inventory/`,
  DELIVERIES: `${API_BASE_URL}/dashboard/deliveries/`,
}

// Export all endpoints as a single object
export default {
  AUTH: AUTH_ENDPOINTS,
  USER: USER_ENDPOINTS,
  STORE: STORE_ENDPOINTS,
  PRODUCT: PRODUCT_ENDPOINTS,
  INVENTORY: INVENTORY_ENDPOINTS,
  ORDER: ORDER_ENDPOINTS,
  DELIVERY: DELIVERY_ENDPOINTS,
  EMPLOYEE: EMPLOYEE_ENDPOINTS,
  DASHBOARD: DASHBOARD_ENDPOINTS,
}

