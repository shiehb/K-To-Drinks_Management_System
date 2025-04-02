"use client"

import { useState, useEffect } from "react"
import { Input, Select } from "../ui"
import { Search, Plus, Minus } from "lucide-react"
import { formatCurrency } from "../../utils/formatters"

const ProductSelector = ({ products, selectedProducts, setSelectedProducts }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [quantities, setQuantities] = useState({})

  // Extract unique categories from products
  useEffect(() => {
    if (products.length > 0) {
      const uniqueCategories = [...new Set(products.map((product) => product.category_name))]
      setCategories(uniqueCategories)
    }
  }, [products])

  // Filter products based on search query and selected category
  useEffect(() => {
    let filtered = [...products]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (product) => product.name.toLowerCase().includes(query) || product.description?.toLowerCase().includes(query),
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter((product) => product.category_name === selectedCategory)
    }

    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedCategory])

  // Initialize quantities from selected products
  useEffect(() => {
    const initialQuantities = {}
    selectedProducts.forEach((product) => {
      initialQuantities[product.id] = product.quantity
    })
    setQuantities(initialQuantities)
  }, [])

  // Handle quantity change
  const handleQuantityChange = (productId, newQuantity) => {
    // Ensure quantity is at least 0
    newQuantity = Math.max(0, newQuantity)

    // Update quantities state
    setQuantities((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }))

    // Update selected products
    if (newQuantity === 0) {
      // Remove product if quantity is 0
      setSelectedProducts((prev) => prev.filter((item) => item.id !== productId))
    } else {
      // Check if product is already selected
      const existingIndex = selectedProducts.findIndex((item) => item.id === productId)

      if (existingIndex >= 0) {
        // Update existing product
        const updatedProducts = [...selectedProducts]
        updatedProducts[existingIndex] = {
          ...updatedProducts[existingIndex],
          quantity: newQuantity,
        }
        setSelectedProducts(updatedProducts)
      } else {
        // Add new product
        const productToAdd = products.find((p) => p.id === productId)
        if (productToAdd) {
          setSelectedProducts((prev) => [
            ...prev,
            {
              id: productToAdd.id,
              name: productToAdd.name,
              price: productToAdd.price,
              quantity: newQuantity,
            },
          ])
        }
      }
    }
  }

  // Check if a product is selected
  const isProductSelected = (productId) => {
    return selectedProducts.some((item) => item.id === productId)
  }

  // Get quantity for a product
  const getQuantity = (productId) => {
    return quantities[productId] || 0
  }

  return (
    <div className="product-selector">
      {/* Search and filter controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="w-full md:w-64">
          <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Selected products summary */}
      {selectedProducts.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-md">
          <h4 className="font-medium mb-2">Selected Products ({selectedProducts.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {selectedProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between bg-white p-2 rounded border">
                <div className="flex-1 truncate">
                  <span className="font-medium">{product.name}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    {product.quantity} × {formatCurrency(product.price)}
                  </span>
                </div>
                <button onClick={() => handleQuantityChange(product.id, 0)} className="text-red-500 hover:text-red-700">
                  <Minus size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="border rounded-md p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{product.name}</h4>
                <span className="font-bold">{formatCurrency(product.price)}</span>
              </div>

              {product.description && <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>}

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  {product.stock_quantity > 0 ? (
                    <span className="text-green-600">{product.stock_quantity} in stock</span>
                  ) : (
                    <span className="text-red-600">Out of stock</span>
                  )}
                </div>

                <div className="flex items-center">
                  <button
                    onClick={() => handleQuantityChange(product.id, getQuantity(product.id) - 1)}
                    className="w-8 h-8 flex items-center justify-center border rounded-l-md bg-gray-50 hover:bg-gray-100"
                    disabled={!isProductSelected(product.id) || getQuantity(product.id) <= 0}
                  >
                    <Minus size={16} />
                  </button>

                  <input
                    type="number"
                    min="0"
                    max={product.stock_quantity}
                    value={getQuantity(product.id)}
                    onChange={(e) => handleQuantityChange(product.id, Number.parseInt(e.target.value) || 0)}
                    className="w-12 h-8 border-y text-center"
                  />

                  <button
                    onClick={() => handleQuantityChange(product.id, getQuantity(product.id) + 1)}
                    className="w-8 h-8 flex items-center justify-center border rounded-r-md bg-gray-50 hover:bg-gray-100"
                    disabled={product.stock_quantity <= getQuantity(product.id)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No products found. Try adjusting your search or filters.
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductSelector

