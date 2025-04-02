"use client"

import { useState } from "react"

const StatusUpdateModal = ({ delivery, onClose, onUpdate }) => {
  const [status, setStatus] = useState(
    delivery.status === "pending" ? "in-transit" : delivery.status === "in-transit" ? "delivered" : delivery.status,
  )
  const [notes, setNotes] = useState(delivery.notes || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!status) {
      alert("Please select a status")
      return
    }

    setIsSubmitting(true)

    try {
      await onUpdate(status, notes)
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Update Delivery Status</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Delivery ID</label>
            <input type="text" value={delivery.id} disabled className="w-full p-2 border rounded bg-gray-100" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Store</label>
            <input type="text" value={delivery.store_name} disabled className="w-full p-2 border rounded bg-gray-100" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Current Status</label>
            <input
              type="text"
              value={delivery.status.replace("-", " ").toUpperCase()}
              disabled
              className="w-full p-2 border rounded bg-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">New Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={isSubmitting}
            >
              {delivery.status === "pending" && <option value="in-transit">IN TRANSIT</option>}
              {delivery.status === "in-transit" && <option value="delivered">DELIVERED</option>}
              <option value="cancelled">CANCELLED</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border rounded"
              rows="3"
              placeholder="Add any notes about this delivery..."
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StatusUpdateModal

