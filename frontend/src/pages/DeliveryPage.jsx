"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import DeliveryDashboard from "../components/delivery/DeliveryDashboard"
import { deliveryService } from "../services/api"
import { handleApiError } from "../utils/apiErrorHandler"

const DeliveryPage = () => {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const fetchDeliveries = async () => {
    try {
      setLoading(true)
      const result = await deliveryService.getAll()

      if (result.success) {
        setDeliveries(result.data)
      } else {
        setError(result.error.message)
        toast.error(result.error.message)
      }
    } catch (error) {
      const errorMessage = handleApiError(error, "Failed to fetch deliveries").message
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateDeliveryStatus = async (id, statusData) => {
    try {
      const result = await deliveryService.updateStatus(id, statusData)

      if (result.success) {
        // Update the delivery in the local state
        setDeliveries((prevDeliveries) =>
          prevDeliveries.map((delivery) => (delivery.id === id ? { ...delivery, ...result.data } : delivery)),
        )

        toast.success("Delivery status updated successfully")
        return true
      } else {
        toast.error(result.error.message)
        return false
      }
    } catch (error) {
      handleApiError(error, "Failed to update delivery status")
      return false
    }
  }

  const uploadSignature = async (id, signatureData) => {
    try {
      const result = await deliveryService.uploadSignature(id, signatureData)

      if (result.success) {
        // Update the delivery in the local state
        setDeliveries((prevDeliveries) =>
          prevDeliveries.map((delivery) => (delivery.id === id ? { ...delivery, has_signature: true } : delivery)),
        )

        toast.success("Signature uploaded successfully")
        return true
      } else {
        toast.error(result.error.message)
        return false
      }
    } catch (error) {
      handleApiError(error, "Failed to upload signature")
      return false
    }
  }

  return (
    <div className="delivery-page">
      <DeliveryDashboard
        deliveries={deliveries}
        loading={loading}
        error={error}
        onStatusUpdate={updateDeliveryStatus}
        onSignatureUpload={uploadSignature}
        onRefresh={fetchDeliveries}
      />
    </div>
  )
}

export default DeliveryPage

