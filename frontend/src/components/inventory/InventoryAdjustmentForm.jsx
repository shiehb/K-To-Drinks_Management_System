"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { inventoryService, productService } from "../../services/api"
import { Button, Card, Input, Select, Textarea } from "../ui"
import BarcodeScanner from "./BarcodeScanner"
import { formatCurrency } from "../../utils/formatters"

const InventoryAdjustmentForm = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [formData, setFormData] = useState({
    product_id: "",
    adjustment_value: "",
    transaction_type: "adjustment",
    reason: "",
    reference: "",
  })
  const [errors, setErrors] = useState({})
  const [selectedProduct, setSelectedProduct] = useState(null)

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await productService.getAll()
      if (response.success) {
        setProducts(response.data)
      } else {
        toast.error("Failed to load products")
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Error loading products")
    } finally {
      setLoading(false)
    }
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }

    // Update selected product when product_id changes
    if (name === "product_id") {
      const product = products.find((p) => p.id.toString() === value)
      setSelectedProduct(product || null)
    }
  }

  // Handle barcode scan
  const handleBarcodeScan = (barcode) => {
    // Find product by barcode or product_id
    const product = products.find((p) => p.product_id === barcode || p.barcode === barcode)

    if (product) {
      setFormData((prev) => ({ ...prev, product_id: product.id.toString() }))
      setSelectedProduct(product)
      setScanning(false)
      toast.success(`Product found: ${product.name}`)
    } else {
      toast.error("Product not found for this barcode")
    }
  }

  // Toggle barcode scanner
  const toggleScanner = () => {
    setScanning(!scanning)
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!formData.product_id) {
      newErrors.product_id = "Please select a product"
    }

    if (!formData.adjustment_value || isNaN(formData.adjustment_value)) {
      newErrors.adjustment_value = "Please enter a valid number"
    }

    if (!formData.transaction_type) {
      newErrors.transaction_type = "Please select a transaction type"
    }

    if (!formData.reason) {
      newErrors.reason = "Please provide a reason for this adjustment"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await inventoryService.adjust(formData)

      if (response.success) {
        toast.success("Inventory adjusted successfully")

        // Reset form
        setFormData({
          product_id: "",
          adjustment_value: "",
          transaction_type: "adjustment",
          reason: "",
          reference: "",
        })
        setSelectedProduct(null)
      } else {
        // Handle validation errors
        if (response.error.fields) {
          setErrors(response.error.fields)
        } else {
          toast.error(response.error.message)
        }
      }
    } catch (error) {
      console.error("Error adjusting inventory:", error)
      toast.error("Failed to adjust inventory")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="inventory-adjustment-form">
      <Card className="p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Inventory Adjustment</h2>

        {scanning ? (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Scan Product Barcode</h3>
            <BarcodeScanner onScan={handleBarcodeScan} />
            <Button variant="outline" onClick={toggleScanner} className="mt-4">
              Cancel Scanning
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="product_id" className="block text-sm font-medium mb-1">
                  Product *
                </label>
                <Select
                  id="product_id"
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleChange}
                  className={errors.product_id ? "border-red-500" : ""}
                  disabled={loading}
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.product_id})
                    </option>
                  ))}
                </Select>
                {errors.product_id && <p className="text-red-500 text-sm mt-1">{errors.product_id}</p>}
              </div>

              <div className="md:w-40">
                <label className="block text-sm font-medium mb-1">&nbsp;</label>
                <Button type="button" variant="outline" onClick={toggleScanner} className="w-full" disabled={loading}>
                  <i className="fas fa-barcode mr-2"></i>
                  Scan Barcode
                </Button>
              </div>
            </div>

            {selectedProduct && (
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">{selectedProduct.name}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Current Stock</p>
                    <p className="font-bold">{selectedProduct.current_stock}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Unit Price</p>
                    <p className="font-bold">{formatCurrency(selectedProduct.unit_price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p>{selectedProduct.category_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reorder Level</p>
                    <p>{selectedProduct.reorder_level}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="adjustment_value" className="block text-sm font-medium mb-1">
                  Adjustment Value *
                </label>
                <Input
                  id="adjustment_value"
                  name="adjustment_value"
                  type="number"
                  value={formData.adjustment_value}
                  onChange={handleChange}
                  placeholder="Enter adjustment value (positive or negative)"
                  className={errors.adjustment_value ? "border-red-500" : ""}
                  disabled={loading}
                />
                {errors.adjustment_value && <p className="text-red-500 text-sm mt-1">{errors.adjustment_value}</p>}
                <p className="text-sm text-gray-500 mt-1">
                  Use positive values for additions and negative values for reductions
                </p>
              </div>

              <div>
                <label htmlFor="transaction_type" className="block text-sm font-medium mb-1">
                  Transaction Type *
                </label>
                <Select
                  id="transaction_type"
                  name="transaction_type"
                  value={formData.transaction_type}
                  onChange={handleChange}
                  className={errors.transaction_type ? "border-red-500" : ""}
                  disabled={loading}
                >
                  <option value="adjustment">Adjustment</option>
                  <option value="in">Stock In</option>
                  <option value="out">Stock Out</option>
                </Select>
                {errors.transaction_type && <p className="text-red-500 text-sm mt-1">{errors.transaction_type}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium mb-1">
                Reason *
              </label>
              <Textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Explain the reason for this adjustment"
                rows={3}
                className={errors.reason ? "border-red-500" : ""}
                disabled={loading}
              />
              {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
            </div>

            <div>
              <label htmlFor="reference" className="block text-sm font-medium mb-1">
                Reference (Optional)
              </label>
              <Input
                id="reference"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="Order ID, Delivery ID, etc."
                disabled={loading}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Submit Adjustment"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}

export default InventoryAdjustmentForm

