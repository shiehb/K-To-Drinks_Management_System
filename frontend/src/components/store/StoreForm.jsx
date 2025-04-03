"use client"

import { useState } from "react"
import { MapPin, ExternalLink } from "lucide-react"
import StoreMap from "./StoreMap"
import { validateStoreForm } from "../../utils/validators"

const StoreForm = ({
  formData,
  handleFormInputChange,
  markerPosition,
  handleMarkerPositionChange,
  handleSaveNewData,
  handleClosePopup,
  isEditMode,
  isLoading,
}) => {
  const [validationErrors, setValidationErrors] = useState({})
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  // Get current location
  const handleGetCurrentLocation = async () => {
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          })
        })

        const { latitude, longitude } = position.coords
        handleMarkerPositionChange(latitude, longitude)

        // Try to get address from coordinates
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        )

        if (response.ok) {
          const data = await response.json()
          if (data.display_name) {
            const newFormData = {
              ...formData,
              location: data.display_name,
              lat: latitude,
              lng: longitude,
            }

            // Update all form fields at once
            Object.keys(newFormData).forEach((key) => {
              const input = document.getElementById(key)
              if (input) {
                input.value = newFormData[key]
              }
            })

            // Trigger change event manually
            handleFormInputChange({ target: { name: "location", value: data.display_name } })
          }
        }
      } catch (error) {
        console.error("Error getting location:", error)
        alert("Unable to get your location. Please check your browser permissions.")
      }
    } else {
      alert("Geolocation is not supported by your browser")
    }
  }

  // Validate form before submission
  const handleSubmit = () => {
    const { isValid, errors } = validateStoreForm(formData)

    if (!isValid) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors({})
    handleSaveNewData()
  }

  return (
    <>
      <h2 className="form-title">{isEditMode ? "Edit Store" : "Create New Store"}</h2>
      <div className="form-container">
        <div className="form-column">
          <div className="form-group">
            <label htmlFor="name">Store Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleFormInputChange}
              required
              placeholder="Enter store name"
              className={validationErrors.name ? "error-input" : ""}
              aria-invalid={!!validationErrors.name}
              aria-describedby={validationErrors.name ? "name-error" : undefined}
            />
            {validationErrors.name && (
              <p id="name-error" className="error-text">
                {validationErrors.name}
              </p>
            )}
          </div>
          <div className="form-group location-group">
            <label htmlFor="location">Location *</label>
            <div className="location-input-wrapper">
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleFormInputChange}
                required
                placeholder="Enter store location"
                className={validationErrors.location ? "error-input" : ""}
                aria-invalid={!!validationErrors.location}
                aria-describedby={validationErrors.location ? "location-error" : undefined}
              />
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="get-location-btn"
                title="Get my current location"
                aria-label="Get my current location"
              >
                <MapPin size={16} />
              </button>
            </div>
            {validationErrors.location && (
              <p id="location-error" className="error-text">
                {validationErrors.location}
              </p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="owner_name">Owner Name *</label>
            <input
              type="text"
              id="owner_name"
              name="owner_name"
              value={formData.owner_name}
              onChange={handleFormInputChange}
              required
              placeholder="Enter owner name"
              className={validationErrors.owner_name ? "error-input" : ""}
              aria-invalid={!!validationErrors.owner_name}
              aria-describedby={validationErrors.owner_name ? "owner-error" : undefined}
            />
            {validationErrors.owner_name && (
              <p id="owner-error" className="error-text">
                {validationErrors.owner_name}
              </p>
            )}
          </div>

          <div className="contact-grid-form">
            <div className="form-group">
              <label htmlFor="number">Contact Number *</label>
              <input
                type="tel"
                id="number"
                name="number"
                value={formData.number}
                onChange={handleFormInputChange}
                required
                placeholder="Enter contact number"
                className={validationErrors.number ? "error-input" : ""}
                aria-invalid={!!validationErrors.number}
                aria-describedby={validationErrors.number ? "number-error" : undefined}
              />
              {validationErrors.number && (
                <p id="number-error" className="error-text">
                  {validationErrors.number}
                </p>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleFormInputChange}
                placeholder="Enter email address (optional)"
                className={validationErrors.email ? "error-input" : ""}
                aria-invalid={!!validationErrors.email}
                aria-describedby={validationErrors.email ? "email-error" : undefined}
              />
              {validationErrors.email && (
                <p id="email-error" className="error-text">
                  {validationErrors.email}
                </p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="day">Day *</label>
            <select
              id="day"
              name="day"
              value={formData.day}
              onChange={handleFormInputChange}
              required
              aria-label="Select delivery day"
            >
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="map-column">
          <div className="map-container">
            <StoreMap
              lat={markerPosition.lat}
              lng={markerPosition.lng}
              onMarkerPositionChange={handleMarkerPositionChange}
              isDraggable={true}
              markerLabel={formData.name || "New Store"}
              markerAddress={formData.location || ""}
            />
          </div>
          <div className="coordinates">
            <div className="coordinate-item">
              <span className="coordinate-label">Latitude:</span>
              <span className="coordinate-value">{markerPosition.lat.toFixed(6)}</span>
            </div>
            <div className="coordinate-item">
              <span className="coordinate-label">Longitude:</span>
              <span className="coordinate-value">{markerPosition.lng.toFixed(6)}</span>
            </div>
            <button
              onClick={() =>
                window.open(`https://www.google.com/maps?q=${markerPosition.lat},${markerPosition.lng}`, "_blank")
              }
              className="preview-map-btn"
              aria-label="Preview in Google Maps"
            >
              <ExternalLink size={16} />
              Preview in Maps
            </button>
          </div>
        </div>
      </div>
      <div className="form-actions">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="save-btn"
          aria-label={isEditMode ? "Update store" : "Create store"}
        >
          {isLoading ? "Saving..." : isEditMode ? "Update Store" : "Create Store"}
        </button>
        <button onClick={handleClosePopup} disabled={isLoading} className="cancel-btn" aria-label="Cancel">
          Cancel
        </button>
      </div>
    </>
  )
}

export default StoreForm

