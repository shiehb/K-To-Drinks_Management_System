"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import api from "../api/api_url"
import "../css/localstore.css"
import LeafletMapPopup from "../components/LeafletMapPopup"
import { toast } from "react-toastify"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const DEFAULT_LAT = 16.63614047965268
const DEFAULT_LNG = 120.31339285476308

const toastConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  pauseOnHover: true,
  draggable: true,
  style: {
    backgroundColor: "var(--background-color)",
    color: "var(--text-color)",
  },
}

export default function LocalStorePage() {
  // State declarations
  const [selectedItem, setSelectedItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [externalLocation, setExternalLocation] = useState(null)
  const [markerPosition, setMarkerPosition] = useState({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
  })
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [data, setData] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
    owner_name: "",
    email: "",
    number: "",
    day: days[0],
  })
  const [selectedDay, setSelectedDay] = useState(days[0])
  const [routeOrder, setRouteOrder] = useState([])
  const [showReorderButtons, setShowReorderButtons] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch stores from API
  const fetchStores = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/stores/?archived=${showArchived}`)
      setData(response.data)
    } catch (err) {
      console.error("Fetch error:", err)
      toast.error(`Failed to load stores: ${err.response?.data?.message || err.message}`, toastConfig)
    } finally {
      setIsLoading(false)
    }
  }, [showArchived])

  // Initial data load
  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  // Initialize user location
  useEffect(() => {
    const initUserLocation = async () => {
      try {
        if (navigator.geolocation) {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              maximumAge: 60000,
            })
          })

          const { latitude, longitude } = position.coords
          const lat = latitude && !isNaN(latitude) ? latitude : DEFAULT_LAT
          const lng = longitude && !isNaN(longitude) ? longitude : DEFAULT_LNG

          setMarkerPosition({ lat, lng })
          setFormData((prev) => ({ ...prev, lat, lng }))
        }
      } catch (err) {
        console.error("Location error:", err)
        toast.error("Using default location", toastConfig)
      }
    }

    initUserLocation()
  }, [])

  // Filter and sort data
  useEffect(() => {
    const filtered = data.filter(
      (item) =>
        item.day === selectedDay &&
        (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.owner_name.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    setRouteOrder(filtered.map((_, index) => index))
  }, [selectedDay, searchQuery, data])

  // Debounced search function
  const debouncedSearch = useMemo(() => {
    const debounce = (func, delay) => {
      let timeoutId
      return function (...args) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => func.apply(this, args), delay)
      }
    }

    return debounce((query) => {
      setSearchQuery(query)
      if (!query) {
        setSelectedItem(null)
        setExternalLocation(null)
        return
      }

      const foundItem = data.find(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.location.toLowerCase().includes(query.toLowerCase()) ||
          item.owner_name.toLowerCase().includes(query.toLowerCase()),
      )

      if (foundItem) {
        setSelectedItem(foundItem)
        setExternalLocation(null)
        setMarkerPosition({ lat: foundItem.lat, lng: foundItem.lng })
        return
      }

      // External location search
      setIsLoading(true)
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then((response) => response.json())
        .then((results) => {
          if (results.length > 0) {
            const firstResult = results[0]
            setExternalLocation({
              name: firstResult.display_name,
              lat: Number.parseFloat(firstResult.lat),
              lng: Number.parseFloat(firstResult.lon),
            })
            setMarkerPosition({
              lat: Number.parseFloat(firstResult.lat),
              lng: Number.parseFloat(firstResult.lon),
            })
          }
        })
        .catch((err) => console.error("Search error:", err))
        .finally(() => setIsLoading(false))
    }, 500)
  }, [data])

  // Event handlers
  const handleSearchInput = (e) => {
    const query = e.target.value
    setSearchInput(query)
    debouncedSearch(query)
  }

  const handleMarkerPositionChange = (lat, lng) => {
    if (isCreateMode || isEditMode) {
      const newLat = lat || DEFAULT_LAT
      const newLng = lng || DEFAULT_LNG
      setMarkerPosition({ lat: newLat, lng: newLng })
      setFormData((prev) => ({ ...prev, lat: newLat, lng: newLng }))
    }
  }

  const handleRowClick = (item) => {
    setSelectedItem(item)
    setMarkerPosition({ lat: item.lat, lng: item.lng })
    setIsCreateMode(false)
    setIsEditMode(false)
  }

  const handleClosePopup = () => {
    setSelectedItem(null)
    setExternalLocation(null)
    setIsCreateMode(false)
    setIsEditMode(false)
    setFormData({
      name: "",
      location: "",
      lat: markerPosition.lat,
      lng: markerPosition.lng,
      owner_name: "",
      email: "",
      number: "",
      day: selectedDay,
    })
  }

  const handleCreateNewData = () => {
    setIsCreateMode(true)
    setIsEditMode(false)
    setSelectedItem(null)
    setExternalLocation(null)
    setFormData({
      name: "",
      location: "",
      lat: markerPosition.lat,
      lng: markerPosition.lng,
      owner_name: "",
      email: "",
      number: "",
      day: selectedDay,
    })
  }

  const handleEditLocation = (item) => {
    setIsEditMode(true)
    setIsCreateMode(false)
    setSelectedItem(item)
    setFormData({
      name: item.name,
      location: item.location,
      lat: item.lat,
      lng: item.lng,
      owner_name: item.owner_name,
      email: item.email,
      number: item.number,
      day: item.day,
    })
  }

  const handleFormInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Form validation
  const validateForm = () => {
    const requiredFields = ["name", "location", "owner_name", "number"]
    const missingFields = requiredFields.filter((field) => !formData[field])

    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(", ")}`, toastConfig)
      return false
    }

    if (isNaN(formData.lat) || isNaN(formData.lng)) {
      toast.error("Coordinates must be valid numbers", toastConfig)
      return false
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error("Please enter a valid email address", toastConfig)
      return false
    }

    if (!/^[0-9+]+$/.test(formData.number)) {
      toast.error("Contact number should contain only numbers and + sign", toastConfig)
      return false
    }

    return true
  }

  // Save store data
  const handleSaveNewData = async () => {
    if (!validateForm()) return

    try {
      setIsLoading(true)
      let response

      if (isEditMode) {
        response = await api.put(`/stores/${selectedItem.id}/`, formData)
      } else {
        response = await api.post("/stores/", formData)
      }

      await fetchStores()
      toast.success(`Store ${isEditMode ? "updated" : "created"} successfully!`, toastConfig)
      handleClosePopup()
    } catch (err) {
      console.error("Save failed:", err)
      toast.error(`Save failed: ${err.response?.data?.message || err.message}`, { ...toastConfig, autoClose: 10000 })
    } finally {
      setIsLoading(false)
    }
  }

  // Archive/unarchive store
  const handleArchiveStore = async (id) => {
    const action = showArchived ? "unarchive" : "archive"
    if (!window.confirm(`Are you sure you want to ${action} this store?`)) return

    try {
      setIsLoading(true)
      await api.patch(`/stores/${id}/archive/`, { archive: !showArchived })
      await fetchStores()
      toast.success(`Store ${action}d successfully!`, toastConfig)
      handleClosePopup()
    } catch (err) {
      console.error("Archive error:", err)
      toast.error(`Failed to ${action} store: ${err.response?.data?.message || err.message}`, toastConfig)
    } finally {
      setIsLoading(false)
    }
  }

  // Route ordering functions
  const moveRouteUp = (index) => {
    if (index > 0) {
      const newOrder = [...routeOrder]
      ;[newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]]
      setRouteOrder(newOrder)
    }
  }

  const moveRouteDown = (index) => {
    if (index < routeOrder.length - 1) {
      const newOrder = [...routeOrder]
      ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
      setRouteOrder(newOrder)
    }
  }

  const toggleReorderButtons = () => {
    setShowReorderButtons(!showReorderButtons)
  }

  // Filtered data
  const filteredDataByDay = useMemo(() => data.filter((item) => item.day === selectedDay), [data, selectedDay])

  const filteredDataBySearch = useMemo(
    () =>
      filteredDataByDay.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.owner_name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [filteredDataByDay, searchQuery],
  )

  return (
    <div className="local-store-page">
      {/* Search and control section */}
      <div className="search-controls">
        <input
          type="text"
          placeholder="Search by name, location or owner..."
          value={searchInput}
          onChange={handleSearchInput}
          disabled={isLoading}
        />
        <div className="button-group">
          <button onClick={handleCreateNewData} disabled={isLoading}>
            {isLoading ? "Loading..." : "Create New Store"}
          </button>
          <button onClick={() => setShowArchived(!showArchived)} disabled={isLoading}>
            {showArchived ? "Hide Archived" : "Show Archived"}
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div
        className={`main-local-content ${
          selectedItem && !isEditMode ? "view-mode" : isCreateMode || isEditMode ? "form-mode" : ""
        }`}
      >
        {/* Table section */}
        <div className="table-section">
          <div className="table-controls">
            <div className="day-filter">
              <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            {!showArchived && (
              <button onClick={toggleReorderButtons}>{showReorderButtons ? "Hide Arrange" : "Arrange Route"}</button>
            )}
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Store Name</th>
                  <th>Location</th>
                  <th>Status</th>
                  {showReorderButtons && !showArchived && <th>Route Arrange</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDataBySearch.length > 0 ? (
                  routeOrder.map((orderIndex, index) => {
                    const item = filteredDataBySearch[orderIndex]
                    if (!item) return null

                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleRowClick(item)}
                        className={`${selectedItem?.id === item.id ? "selected-row" : ""} ${
                          item.is_archived ? "archived-row" : ""
                        }`}
                      >
                        <td>{index + 1}</td>
                        <td>{item.name}</td>
                        <td>{item.location}</td>
                        <td>
                          {item.is_archived ? (
                            <span className="archived-badge">Archived</span>
                          ) : (
                            <span className="active-badge">Active</span>
                          )}
                        </td>
                        {showReorderButtons && !showArchived && !item.is_archived && (
                          <td className="reorder-buttons">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                moveRouteUp(index)
                              }}
                              disabled={index === 0}
                            >
                              ↑
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                moveRouteDown(index)
                              }}
                              disabled={index === routeOrder.length - 1}
                            >
                              ↓
                            </button>
                          </td>
                        )}
                        <td className="actions-cell">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditLocation(item)
                            }}
                            disabled={isLoading || item.is_archived}
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleArchiveStore(item.id)
                            }}
                            disabled={isLoading}
                          >
                            {item.is_archived ? "Unarchive" : "Archive"}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={showReorderButtons && !showArchived ? 6 : 5}>No stores found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details section */}
        {(selectedItem || externalLocation || isCreateMode || isEditMode) && (
          <div className="details-section">
            <div className={`details-card ${isCreateMode || isEditMode ? "form-mode" : ""}`}>
              <button className="close-btn" onClick={handleClosePopup}>
                ×
              </button>

              {selectedItem && !isEditMode ? (
                <>
                  <h2>{selectedItem.name}</h2>
                  <div className="location-info">
                    <p>
                      <strong>Location:</strong> {selectedItem.location}
                    </p>
                    <p>
                      <strong>Owner:</strong> {selectedItem.owner_name}
                    </p>
                    <p>
                      <strong>Contact:</strong> {selectedItem.number}
                    </p>
                    {selectedItem.email && (
                      <p>
                        <strong>Email:</strong> {selectedItem.email}
                      </p>
                    )}
                    <p>
                      <strong>Day:</strong> {selectedItem.day}
                    </p>
                    {selectedItem.is_archived && <p className="archived-notice">Archived</p>}
                  </div>
                  <div className="map-container">
                    <LeafletMapPopup lat={selectedItem.lat} lng={selectedItem.lng} />
                  </div>
                  <div className="action-buttons">
                    <button
                      onClick={() =>
                        window.open(`https://www.google.com/maps?q=${selectedItem.lat},${selectedItem.lng}`, "_blank")
                      }
                    >
                      Open in Maps
                    </button>
                    <button
                      onClick={() => handleEditLocation(selectedItem)}
                      disabled={isLoading || selectedItem.is_archived}
                    >
                      Edit Store
                    </button>
                    <button onClick={() => handleArchiveStore(selectedItem.id)} disabled={isLoading}>
                      {selectedItem.is_archived ? "Unarchive" : "Archive"}
                    </button>
                  </div>
                </>
              ) : isCreateMode || isEditMode ? (
                <>
                  <h2>{isEditMode ? "Edit Store" : "Create New Store"}</h2>
                  <div className="form-container">
                    <div className="form-column">
                      <div className="form-group">
                        <label>Store Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleFormInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Location *</label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleFormInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Owner Name *</label>
                        <input
                          type="text"
                          name="owner_name"
                          value={formData.owner_name}
                          onChange={handleFormInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Contact Number *</label>
                        <input
                          type="tel"
                          name="number"
                          value={formData.number}
                          onChange={handleFormInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleFormInputChange} />
                      </div>
                      <div className="form-group">
                        <label>Day *</label>
                        <select name="day" value={formData.day} onChange={handleFormInputChange} required>
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
                        <LeafletMapPopup
                          lat={markerPosition.lat}
                          lng={markerPosition.lng}
                          onMarkerPositionChange={handleMarkerPositionChange}
                          isDraggable={isCreateMode || isEditMode}
                        />
                      </div>
                      <div className="coordinates">
                        <p>Lat: {markerPosition.lat.toFixed(6)}</p>
                        <p>Lng: {markerPosition.lng.toFixed(6)}</p>
                        <button
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps?q=${markerPosition.lat},${markerPosition.lng}`,
                              "_blank",
                            )
                          }
                        >
                          Preview in Maps
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button onClick={handleSaveNewData} disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save"}
                    </button>
                    <button onClick={handleClosePopup} disabled={isLoading}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : externalLocation ? (
                <>
                  <h2>{externalLocation.name}</h2>
                  <p className="external-location">External location</p>
                  <div className="map-container">
                    <LeafletMapPopup lat={externalLocation.lat} lng={externalLocation.lng} />
                  </div>
                  <div className="action-buttons">
                    <button
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps?q=${externalLocation.lat},${externalLocation.lng}`,
                          "_blank",
                        )
                      }
                    >
                      Open in Maps
                    </button>
                    <button
                      onClick={() => {
                        setFormData({
                          name: externalLocation.name.split(",")[0],
                          location: externalLocation.name,
                          lat: externalLocation.lat,
                          lng: externalLocation.lng,
                          owner_name: "",
                          email: "",
                          number: "",
                          day: selectedDay,
                        })
                        setIsCreateMode(true)
                        setExternalLocation(null)
                      }}
                    >
                      Save This Location
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

