"use client"

import { createContext, useContext, useState } from "react"
import { useAuth } from "./AuthContext"
import api from "../api/api_url"
import { handleApiError } from "../utils/apiErrorHandler"

// Create context
const AppContext = createContext()

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

// App provider component
export const AppProvider = ({ children }) => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [appData, setAppData] = useState({
    stores: [],
    products: [],
    categories: [],
    suppliers: [],
    employees: [],
    lowStockItems: [],
    expiringProducts: [],
    recentOrders: [],
    pendingDeliveries: [],
  })
  const [lastUpdated, setLastUpdated] = useState({
    stores: null,
    products: null,
    categories: null,
    suppliers: null,
    employees: null,
    lowStockItems: null,
    expiringProducts: null,
    recentOrders: null,
    pendingDeliveries: null,
  })

  // Function to fetch data with caching
  const fetchData = async (endpoint, dataKey, params = {}, forceRefresh = false) => {
    // Skip if not authenticated
    if (!user) return

    // Check if we need to refresh the data
    const shouldRefresh =
      forceRefresh || !lastUpdated[dataKey] || new Date() - new Date(lastUpdated[dataKey]) > 5 * 60 * 1000 // 5 minutes cache

    if (!shouldRefresh) {
      return appData[dataKey]
    }

    try {
      setIsLoading(true)
      const response = await api.get(endpoint, { params })

      // Update state with new data
      setAppData((prev) => ({
        ...prev,
        [dataKey]: response.data,
      }))

      // Update last updated timestamp
      setLastUpdated((prev) => ({
        ...prev,
        [dataKey]: new Date(),
      }))

      return response.data
    } catch (error) {
      handleApiError(error, `Failed to fetch ${dataKey}`)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch stores
  const fetchStores = (params = {}, forceRefresh = false) => {
    return fetchData("/stores/", "stores", params, forceRefresh)
  }

  // Fetch products
  const fetchProducts = (params = {}, forceRefresh = false) => {
    return fetchData("/products/", "products", params, forceRefresh)
  }

  // Fetch product categories
  const fetchCategories = (forceRefresh = false) => {
    return fetchData("/product-categories/", "categories", {}, forceRefresh)
  }

  // Fetch suppliers
  const fetchSuppliers = (forceRefresh = false) => {
    return fetchData("/suppliers/", "suppliers", {}, forceRefresh)
  }

  // Fetch employees
  const fetchEmployees = (params = {}, forceRefresh = false) => {
    return fetchData("/employees/", "employees", params, forceRefresh)
  }

  // Fetch low stock items
  const fetchLowStockItems = (forceRefresh = false) => {
    return fetchData("/inventory/low-stock/", "lowStockItems", {}, forceRefresh)
  }

  // Fetch expiring products
  const fetchExpiringProducts = (forceRefresh = false) => {
    return fetchData("/product-expiry/", "expiringProducts", {}, forceRefresh)
  }

  // Fetch recent orders
  const fetchRecentOrders = (forceRefresh = false) => {
    return fetchData("/orders/", "recentOrders", { limit: 5 }, forceRefresh)
  }

  // Fetch pending deliveries
  const fetchPendingDeliveries = (forceRefresh = false) => {
    return fetchData("/deliveries/", "pendingDeliveries", { status: "pending" }, forceRefresh)
  }

  // Clear all cached data
  const clearCache = () => {
    setLastUpdated({
      stores: null,
      products: null,
      categories: null,
      suppliers: null,
      employees: null,
      lowStockItems: null,
      expiringProducts: null,
      recentOrders: null,
      pendingDeliveries: null,
    })
  }

  // Context value
  const value = {
    isLoading,
    appData,
    lastUpdated,
    fetchStores,
    fetchProducts,
    fetchCategories,
    fetchSuppliers,
    fetchEmployees,
    fetchLowStockItems,
    fetchExpiringProducts,
    fetchRecentOrders,
    fetchPendingDeliveries,
    clearCache,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export default AppContext

