"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { AuthProvider } from "./context/AuthContext"
import { AppProvider } from "./context/AppContext"
import Layout from "./components/Layout"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import UserPage from "./pages/UserPage"
import LocalStorePage from "./pages/LocalStorePage"
import InventoryPage from "./pages/InventoryPage"
import ProductsPage from "./pages/ProductsPage"
import OrderPage from "./pages/OrderPage"
import DeliveryPage from "./pages/DeliveryPage"
import ProtectedRoute from "./components/ProtectedRoute"
import ConnectionManager from "./components/ConnectionManager"
import { validateEnvironment } from "./config/environment"

function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const isValid = validateEnvironment()

  useEffect(() => {
    // Simulate fetching users
    const fetchUsers = async () => {
      try {
        // In a real app, this would be an API call
        const mockUsers = [
          {
            id: 1,
            username: "admin",
            name: "Admin User",
            email: "admin@example.com",
            role: "manager",
            status: "active",
          },
          {
            id: 2,
            username: "driver1",
            name: "Jericho Urbano",
            email: "jericho@example.com",
            role: "delivery_driver",
            status: "active",
          },
          {
            id: 3,
            username: "driver2",
            name: "Harry Zabate",
            email: "harry@example.com",
            role: "delivery_driver",
            status: "active",
          },
          {
            id: 4,
            username: "employee1",
            name: "John Doe",
            email: "john@example.com",
            role: "employee",
            status: "active",
          },
          {
            id: 5,
            username: "employee2",
            name: "Jane Smith",
            email: "jane@example.com",
            role: "employee",
            status: "archived",
          },
        ]
        setUsers(mockUsers)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <ConnectionManager>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="user" element={<UserPage users={users} loading={loading} setUsers={setUsers} />} />
                <Route path="localstore" element={<LocalStorePage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="order" element={<OrderPage />} />
                <Route path="delivery" element={<DeliveryPage />} />
              </Route>
            </Routes>
          </ConnectionManager>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
        </AppProvider>
      </AuthProvider>
    </Router>
  )
}

export default App

