"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { orderService, storeService, productService } from "../../services/api"
import { Button, Card, Select, Textarea } from "../ui"
import ProductSelector from "./ProductSelector"
import { formatCurrency } from "../../utils/formatters"

const OrderWizard = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [stores, setStores] = useState([])
  const [products, setProducts] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [orderData, setOrderData] = useState({
    store_id: "",
    delivery_day: "",
    notes: "",
    products: [],
  })
  const [errors, setErrors] = useState({})
  const [receiptUrl, setReceiptUrl] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Load stores and products on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true)
      try {
        // Fetch stores
        const storesResponse = await storeService.getAll()
        if (storesResponse.success) {
          setStores(storesResponse.data)
        } else {
          toast.error("Failed to load stores")
        }

        // Fetch products
        const productsResponse = await productService.getAll()
        if (productsResponse.success) {
          setProducts(productsResponse.data)
        } else {
          toast.error("Failed to load products")
        }
      } catch (error) {
        console.error("Error fetching initial data:", error)
        toast.error("Error loading data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()

    // Load draft if available
    const savedDraft = localStorage.getItem("order_draft")
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft)
        setOrderData(draftData)
        if (draftData.products && draftData.products.length > 0) {
          setSelectedProducts(draftData.products)
        }
        toast.info("Draft loaded")
      } catch (error) {
        console.error("Error parsing draft:", error)
      }
    }

    // Setup auto-save
    const intervalId = setInterval(() => {
      if (orderData.store_id || selectedProducts.length > 0) {
        const dataToSave = {
          ...orderData,
          products: selectedProducts,
        }
        localStorage.setItem("order_draft", JSON.stringify(dataToSave))
      }
    }, 30000) // Save every 30 seconds

    return () => clearInterval(intervalId)
  }, [])

  // Update order data when selected products change
  useEffect(() => {
    setOrderData((prev) => ({
      ...prev,
      products: selectedProducts.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      })),
    }))
  }, [selectedProducts])

  // Handle store selection
  const handleStoreChange = (e) => {
    const storeId = e.target.value
    setOrderData((prev) => ({ ...prev, store_id: storeId }))

    // Auto-select delivery day based on store
    if (storeId) {
      const selectedStore = stores.find((store) => store.id.toString() === storeId)
      if (selectedStore) {
        setOrderData((prev) => ({ ...prev, delivery_day: selectedStore.day }))
      }
    }
  }

  // Validate current step
  const validateStep = () => {
    const newErrors = {}

    if (currentStep === 1) {
      if (!orderData.store_id) newErrors.store_id = "Please select a store"
      if (!orderData.delivery_day) newErrors.delivery_day = "Please select a delivery day"
    } else if (currentStep === 2) {
      if (selectedProducts.length === 0) {
        newErrors.products = "Please select at least one product"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Navigate between steps
  const goToNextStep = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const goToPreviousStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  // Calculate order totals
  const calculateTotals = () => {
    const subtotal = selectedProducts.reduce((sum, item) => sum + item.quantity * item.price, 0)
    const taxRate = 2.0 // 2% tax
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    return { subtotal, taxRate, taxAmount, total }
  }

  // Handle order submission
  const handleSubmitOrder = async () => {
    if (!validateStep()) return

    setIsLoading(true)
    try {
      const response = await orderService.create(orderData)

      if (response.success) {
        // Clear draft after successful submission
        localStorage.removeItem("order_draft")

        // Generate receipt PDF
        const pdfResponse = await orderService.generatePdf(response.data.id)
        if (pdfResponse.success) {
          // Create a blob URL for the PDF
          const blob = new Blob([pdfResponse.data], { type: "application/pdf" })
          setReceiptUrl(URL.createObjectURL(blob))
        }

        setShowConfirmation(true)
      } else {
        // Handle validation errors
        if (response.error.fields) {
          setErrors(response.error.fields)
        } else {
          toast.error(response.error.message)
        }
      }
    } catch (error) {
      console.error("Order submission failed:", error)
      toast.error("Failed to submit order")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle order completion
  const handleCompleteOrder = () => {
    navigate("/orders")
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Step 1: Select Store and Delivery Day</h3>

            <div>
              <label htmlFor="store_id" className="block text-sm font-medium mb-1">
                Store *
              </label>
              <Select
                id="store_id"
                value={orderData.store_id}
                onChange={handleStoreChange}
                className={errors.store_id ? "border-red-500" : ""}
              >
                <option value="">Select a store</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </Select>
              {errors.store_id && <p className="text-red-500 text-sm mt-1">{errors.store_id}</p>}
            </div>

            <div>
              <label htmlFor="delivery_day" className="block text-sm font-medium mb-1">
                Delivery Day *
              </label>
              <Select
                id="delivery_day"
                value={orderData.delivery_day}
                onChange={(e) => setOrderData((prev) => ({ ...prev, delivery_day: e.target.value }))}
                className={errors.delivery_day ? "border-red-500" : ""}
              >
                <option value="">Select a day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </Select>
              {errors.delivery_day && <p className="text-red-500 text-sm mt-1">{errors.delivery_day}</p>}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Step 2: Select Products</h3>

            <ProductSelector
              products={products}
              selectedProducts={selectedProducts}
              setSelectedProducts={setSelectedProducts}
            />

            {errors.products && <p className="text-red-500 text-sm mt-1">{errors.products}</p>}
          </div>
        )

      case 3:
        const { subtotal, taxRate, taxAmount, total } = calculateTotals()

        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Step 3: Review and Confirm</h3>

            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium mb-2">Store Information</h4>
              <p>
                <strong>Store:</strong> {stores.find((s) => s.id.toString() === orderData.store_id)?.name}
              </p>
              <p>
                <strong>Delivery Day:</strong> {orderData.delivery_day}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Order Items</h4>
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{product.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(product.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatCurrency(product.quantity * product.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tax ({taxRate}%):</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-1">
                Order Notes (Optional)
              </label>
              <Textarea
                id="notes"
                value={orderData.notes}
                onChange={(e) => setOrderData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any special instructions or notes for this order"
                rows={3}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Render confirmation modal
  const renderConfirmationModal = () => {
    if (!showConfirmation) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-xl font-bold mb-4 text-green-600">Order Submitted Successfully!</h3>
          <p className="mb-4">Your order has been submitted and a confirmation has been sent to the store.</p>

          {receiptUrl && (
            <div className="mb-4">
              <a
                href={receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <i className="fas fa-file-pdf mr-2"></i>
                View Receipt
              </a>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleCompleteOrder}>Done</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="order-wizard-container">
      <Card className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Create New Order</h2>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${currentStep > step ? "bg-blue-600" : "bg-gray-200"}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <div className="text-sm">Store Selection</div>
            <div className="text-sm">Products</div>
            <div className="text-sm">Review & Confirm</div>
          </div>
        </div>

        {/* Step content */}
        {renderStepContent()}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 pt-4 border-t">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? () => navigate("/orders") : goToPreviousStep}
            disabled={isLoading}
          >
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>

          <Button onClick={currentStep < 3 ? goToNextStep : handleSubmitOrder} disabled={isLoading}>
            {isLoading ? "Processing..." : currentStep < 3 ? "Next" : "Submit Order"}
          </Button>
        </div>
      </Card>

      {/* Confirmation modal */}
      {renderConfirmationModal()}
    </div>
  )
}

export default OrderWizard

