"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { Search, Plus, Minus } from "lucide-react"
import "../css/order.css"
import api from "../api/api_url";

export default function OrderPage() {
  // State for store selection
  const [selectedStore, setSelectedStore] = useState("")
  const [stores, setStores] = useState([])
  const [storesLoading, setStoresLoading] = useState(false)

  // State for product search and selection
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState([
    { id: 1, name: "Coke", href: "../css/products/coke.webp" },
    { id: 2, name: "Lemon Dou", href: "../css/products/lemon-dou.webp" },
    { id: 3, name: "Sprite", href: "../css/products/sprite.webp" },
    { id: 4, name: "Royal", href: "../css/products/royal.webp" },
    { id: 5, name: "Wilkins", href: "./css/products/wilkins.webp" },
  ])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [availableStock, setAvailableStock] = useState(0)

  // State for order items
  const [orderItems, setOrderItems] = useState([])

  // State for size selection
  const [selectedSize, setSelectedSize] = useState("large")
  const availableSizes = ['250 ml', '300 ml', '400 ml', '600 ml', '750 ml', '1250 ml', '1500 ml', '1750 ml', '2000 ml']

  // Tax rate
  const TAX_RATE = 2.0

 // Fetch stores on component mount
 useEffect(() => {
  fetchStores()
}, [])

// Fetch products when category changes
useEffect(() => {
  if (selectedCategory) {
    fetchProducts(selectedCategory.id)
  }
}, [selectedCategory])

// Replace the mock fetchStores function with a real API call
const fetchStores = async () => {
  setStoresLoading(true)
  try {
    // Make a real API call to the backend
    const response = await api.get("/stores/")

    // Process the response data
    const storeData = response.data.map((store) => ({
      id: store.id,
      name: store.name,
    }))

    setStores(storeData)

    // If stores were fetched successfully, select the first one by default
    if (storeData.length > 0) {
      setSelectedStore(storeData[0].id.toString())
    }
  } catch (error) {
    console.error("Error fetching stores:", error)
    toast.error("Failed to load stores from the backend")

    // Fallback to empty array if the API call fails
    setStores([])
  } finally {
    setStoresLoading(false)
  }
}
  // Mock function to fetch products
  const fetchProducts = async (categoryId) => {
    setProductsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock data
      const mockProducts = [
        { id: 1, name: "Laptop - Model X", price: 800.0, stock: 45747 },
        { id: 2, name: "Smartphone - Model Y", price: 600.0, stock: 32500 },
        { id: 3, name: "Wireless Headphones", price: 100.0, stock: 15000 },
        { id: 4, name: "External Hard Drive - 2TB", price: 120.0, stock: 8900 },
        { id: 5, name: "Tablet - Model Z", price: 400.0, stock: 12300 },
      ]

      setProducts(mockProducts)
      setAvailableStock(mockProducts[0].stock)
      setSelectedProduct(mockProducts[0])
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to load products")
    } finally {
      setProductsLoading(false)
    }
  }

  // Handle quantity change
  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(value, availableStock))
    setQuantity(newQuantity)
  }

  // Handle adding item to order
  const handleAddToOrder = () => {
    if (!selectedProduct) {
      toast.error("Please select a product")
      return
    }

    if (!selectedStore) {
      toast.error("Please select a store")
      return
    }

    // Check if item already exists in order
    const existingItemIndex = orderItems.findIndex((item) => item.id === selectedProduct.id)

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      const updatedItems = [...orderItems]
      updatedItems[existingItemIndex].quantity += quantity
      updatedItems[existingItemIndex].total =
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].price
      setOrderItems(updatedItems)
    } else {
      // Add new item
      const newItem = {
        id: selectedProduct.id,
        description: selectedProduct.name,
        quantity: quantity,
        unitPrice: selectedProduct.price,
        total: selectedProduct.price * quantity,
      }

      setOrderItems([...orderItems, newItem])
    }

    // Reset quantity
    setQuantity(1)
    toast.success("Item added to order")
  }

  // Handle completing the order
  const handleCompleteOrder = () => {
    if (orderItems.length === 0) {
      toast.error("Please add items to your order")
      return
    }

    // Here you would typically send the order to your backend
    toast.success("Order submitted successfully!")

    // Reset order
    setOrderItems([])
    setQuantity(1)
    setSelectedProduct(null)
    setSelectedCategory(null)
  }

  // Calculate order totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0)
  const taxAmount = (subtotal * TAX_RATE) / 100
  const totalAmount = subtotal + taxAmount

  return (
    <div className="order-page">
      <div className="order-container">
        <div className="product-selection">
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="SEARCH"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="search-icon" />
            </div>

            <div className="store-selector">
              <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} className="store-select">
                <option value="">STORE NAME</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="categories-section">
            <h3 className="section-title">CATEGORIES</h3>
            <div className="categories-grid">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`category-item ${selectedCategory?.id === category.id ? "selected" : ""}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="category-icon">
                    <img src={`/placeholder.svg?height=40&width=40`} alt={category.name} />
                  </div>
                  <span className="category-name">{category.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="size-section">
            <div className="size-options">
              {availableSizes.map((size, index) => (
                <button
                  key={index}
                  className={`size-button ${selectedSize === size ? "selected" : ""}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="quantity-section">
            <div className="quantity-control">
              <button
                className="quantity-button"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus size={20} />
              </button>

              <input
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
                className="quantity-input"
                min="1"
                max={availableStock}
              />

              <button
                className="quantity-button"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= availableStock}
              >
                <Plus size={20} />
              </button>

              <span className="stock-info">{availableStock} available stocks</span>
            </div>
          </div>

          <div className="action-buttons">
            <button className="add-button" onClick={handleAddToOrder}>
              ADD
            </button>
          </div>
        </div>

        <div className="order-summary">
          <div className="order-table">
            <table>
              <thead>
                <tr>
                  <th>DESCRIPTION</th>
                  <th>QUANTITY</th>
                  <th>UNIT PRICE</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.length > 0 ? (
                  orderItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.description}</td>
                      <td>{item.quantity}</td>
                      <td>${item.unitPrice.toFixed(2)}</td>
                      <td>${item.total.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-order">
                      No items added yet
                    </td>
                  </tr>
                )}
                {/* Empty rows to fill space */}
                {Array.from({ length: Math.max(0, 5 - orderItems.length) }).map((_, index) => (
                  <tr key={`empty-${index}`} className="empty-row">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="order-notes">
            <div className="notes-section">
              <h4>NOTES</h4>
              <textarea className="notes-input" placeholder="Add notes here..."></textarea>
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>SUBTOTAL</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>TAX RATE</span>
                <span>{TAX_RATE.toFixed(1)}%</span>
              </div>
              <div className="total-row">
                <span>TAX AMOUNT</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="total-row grand-total">
                <span>TOTAL AMOUNT DUE</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="complete-order">
            <button className="done-button" onClick={handleCompleteOrder}>
              DONE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

