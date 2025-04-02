import axios from "axios"
import { handleApiError } from "../utils/apiErrorHandler"
import endpoints from "../config/apiEndpoints"

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle token refresh if 401 error
    if (error.response?.status === 401 && !error.config._retry) {
      try {
        error.config._retry = true
        const refreshToken = localStorage.getItem("refreshToken")

        if (refreshToken) {
          const response = await axios.post(endpoints.AUTH.REFRESH, {
            refresh: refreshToken,
          })

          if (response.data.access) {
            localStorage.setItem("token", response.data.access)
            api.defaults.headers.Authorization = `Bearer ${response.data.access}`
            return api(error.config)
          }
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
        window.location.href = "/"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// Auth service
export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post(endpoints.AUTH.LOGIN, credentials)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Login failed") }
    }
  },

  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post(endpoints.AUTH.REFRESH, { refresh: refreshToken })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Token refresh failed", false) }
    }
  },

  verifyToken: async (token) => {
    try {
      const response = await api.post(endpoints.AUTH.VERIFY, { token })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Token verification failed", false) }
    }
  },

  changePassword: async (data) => {
    try {
      const response = await api.post(endpoints.AUTH.CHANGE_PASSWORD, data)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Password change failed") }
    }
  },
}

// User service
export const userService = {
  getAll: async () => {
    try {
      const response = await api.get(endpoints.USER.LIST)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch users") }
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(endpoints.USER.DETAIL(id))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch user") }
    }
  },

  create: async (userData) => {
    try {
      const response = await api.post(endpoints.USER.CREATE, userData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to create user") }
    }
  },

  update: async (id, userData) => {
    try {
      const response = await api.put(endpoints.USER.UPDATE(id), userData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to update user") }
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(endpoints.USER.DELETE(id))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to delete user") }
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get(endpoints.USER.PROFILE)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch profile") }
    }
  },
}

// Store service
export const storeService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get(endpoints.STORE.LIST, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch stores") }
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(endpoints.STORE.DETAIL(id))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch store") }
    }
  },

  create: async (storeData) => {
    try {
      const response = await api.post(endpoints.STORE.CREATE, storeData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to create store") }
    }
  },

  update: async (id, storeData) => {
    try {
      const response = await api.put(endpoints.STORE.UPDATE(id), storeData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to update store") }
    }
  },

  archive: async (id) => {
    try {
      const response = await api.post(endpoints.STORE.ARCHIVE(id))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to archive store") }
    }
  },

  getByDay: async (day) => {
    try {
      const response = await api.get(endpoints.STORE.BY_DAY(day))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch stores by day") }
    }
  },
}

// Product service
export const productService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get(endpoints.PRODUCT.LIST, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch products") }
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(endpoints.PRODUCT.DETAIL(id))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch product") }
    }
  },

  create: async (productData) => {
    try {
      const response = await api.post(endpoints.PRODUCT.CREATE, productData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to create product") }
    }
  },

  update: async (id, productData) => {
    try {
      const response = await api.put(endpoints.PRODUCT.UPDATE(id), productData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to update product") }
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get(endpoints.PRODUCT.CATEGORIES)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch product categories") }
    }
  },

  getSuppliers: async () => {
    try {
      const response = await api.get(endpoints.PRODUCT.SUPPLIERS)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch suppliers") }
    }
  },
}

// Inventory service
export const inventoryService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get(endpoints.INVENTORY.LIST, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch inventory") }
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(endpoints.INVENTORY.DETAIL(id))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch inventory item") }
    }
  },

  adjustStock: async (adjustmentData) => {
    try {
      const response = await api.post(endpoints.INVENTORY.ADJUST, adjustmentData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to adjust inventory") }
    }
  },

  getTransactions: async (params = {}) => {
    try {
      const response = await api.get(endpoints.INVENTORY.TRANSACTIONS, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch inventory transactions") }
    }
  },

  getLowStock: async () => {
    try {
      const response = await api.get(endpoints.INVENTORY.LOW_STOCK)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch low stock items") }
    }
  },

  getExpiringProducts: async () => {
    try {
      const response = await api.get(endpoints.INVENTORY.EXPIRING)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch expiring products") }
    }
  },
}

// Order service
export const orderService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get(endpoints.ORDER.LIST, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch orders") }
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(endpoints.ORDER.DETAIL(id))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch order") }
    }
  },

  create: async (orderData) => {
    try {
      const response = await api.post(endpoints.ORDER.CREATE, orderData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to create order") }
    }
  },

  update: async (id, orderData) => {
    try {
      const response = await api.put(endpoints.ORDER.UPDATE(id), orderData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to update order") }
    }
  },

  getReceipt: async (id) => {
    try {
      const response = await api.get(endpoints.ORDER.RECEIPT(id))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch receipt") }
    }
  },

  getPdf: async (id) => {
    try {
      const response = await api.get(endpoints.ORDER.PDF(id), {
        responseType: "blob",
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch PDF") }
    }
  },
}

// Delivery service
export const deliveryService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get(endpoints.DELIVERY.LIST, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch deliveries") }
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(endpoints.DELIVERY.DETAIL(id))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch delivery") }
    }
  },

  create: async (deliveryData) => {
    try {
      const response = await api.post(endpoints.DELIVERY.CREATE, deliveryData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to create delivery") }
    }
  },

  updateStatus: async (id, statusData) => {
    try {
      const response = await api.post(endpoints.DELIVERY.UPDATE_STATUS(id), statusData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to update delivery status") }
    }
  },

  uploadSignature: async (id, signatureData) => {
    try {
      const formData = new FormData()

      // If signatureData is a base64 string, convert it to a Blob
      if (typeof signatureData === "string" && signatureData.startsWith("data:image")) {
        const byteString = atob(signatureData.split(",")[1])
        const mimeString = signatureData.split(",")[0].split(":")[1].split(";")[0]
        const ab = new ArrayBuffer(byteString.length)
        const ia = new Uint8Array(ab)

        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i)
        }

        const blob = new Blob([ab], { type: mimeString })
        formData.append("signature", blob, "signature.png")
      } else if (signatureData instanceof Blob) {
        formData.append("signature", signatureData, "signature.png")
      } else {
        formData.append("signature_data", JSON.stringify(signatureData))
      }

      const response = await api.post(endpoints.DELIVERY.SIGNATURE(id), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to upload signature") }
    }
  },

  getRoutes: async (params = {}) => {
    try {
      const response = await api.get(endpoints.DELIVERY.ROUTES, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch delivery routes") }
    }
  },
}

// Employee service
export const employeeService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get(endpoints.EMPLOYEE.LIST, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch employees") }
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(endpoints.EMPLOYEE.DETAIL(id))
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch employee") }
    }
  },

  create: async (employeeData) => {
    try {
      const response = await api.post(endpoints.EMPLOYEE.CREATE, employeeData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to create employee") }
    }
  },

  update: async (id, employeeData) => {
    try {
      const response = await api.put(endpoints.EMPLOYEE.UPDATE(id), employeeData)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to update employee") }
    }
  },

  getDeliveryEmployees: async () => {
    try {
      const response = await api.get(endpoints.EMPLOYEE.DELIVERY_STAFF)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch delivery staff") }
    }
  },
}

// Dashboard service
export const dashboardService = {
  getSummary: async () => {
    try {
      const response = await api.get(endpoints.DASHBOARD.SUMMARY)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch dashboard summary") }
    }
  },

  getSales: async (params = {}) => {
    try {
      const response = await api.get(endpoints.DASHBOARD.SALES, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch sales data") }
    }
  },

  getInventory: async () => {
    try {
      const response = await api.get(endpoints.DASHBOARD.INVENTORY)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch inventory dashboard data") }
    }
  },

  getDeliveries: async (params = {}) => {
    try {
      const response = await api.get(endpoints.DASHBOARD.DELIVERIES, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: handleApiError(error, "Failed to fetch delivery dashboard data") }
    }
  },
}

// Export all services
export default {
  auth: authService,
  user: userService,
  store: storeService,
  product: productService,
  inventory: inventoryService,
  order: orderService,
  delivery: deliveryService,
  employee: employeeService,
  dashboard: dashboardService,
}

// Export the axios instance for direct use
export { api }

