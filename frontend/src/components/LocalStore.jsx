"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import api from "../api/api_url"
import "../css/localstore.css"
import StoreMap from "./store/StoreMap" // We'll create this component
import StoreForm from "./store/StoreForm" // We'll create this component
import StoreDetails from "./store/StoreDetails" // We'll create this component
import StoreTable from "./store/StoreTable" // We'll create this component
import { toast } from "react-toastify"
import { Search, Plus, Archive } from "lucide-react"

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

export default function LocalStore() {
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
    day: "Monday",
  })
  const [selectedDay, setSelectedDay] = useState("Monday")
  const [routeOrder, setRouteOrder] = useState([])
  const [showReorderButtons, setShowReorderButtons] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showRouteView, setShowRouteView] = useState(false)
  const tableRef = useRef(null)
  const [showTraffic, setShowTraffic] = useState(false)
  

  // Fetch stores from API
  const fetchStores = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/stores/?archived=${showArchived}`)
      // Check if response.data is an object with stores property
      setData(Array.isArray(response.data) ? response.data : response.data.stores || [])
    } catch (err) {
      console.error("Fetch error:", err)
      toast.error(`Failed to load stores: ${err.response?.data?.message || err.message}`, toastConfig)
      setData([]) // Ensure data is always an array
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
  const filtered = Array.isArray(data) ? data.filter((item) => {
      return (
          item.day === selectedDay &&
          (
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.owner_name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
  }) : [];

  setRouteOrder(filtered.map((_, index) => index));
}, [selectedDay, searchQuery, data]);


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
    setShowRouteView(false)
  }

  const handleClosePopup = () => {
    setSelectedItem(null)
    setExternalLocation(null)
    setIsCreateMode(false)
    setIsEditMode(false)
    setShowRouteView(false)
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
    setShowRouteView(false)
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
    setShowRouteView(false)
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

  // Toggle route view
  const handleToggleRouteView = () => {
    if (!selectedItem) return
    setShowRouteView(!showRouteView)
  }

  // Toggle traffic view
  const handleToggleTraffic = () => {
    if (!selectedItem) return
    setShowTraffic(!showTraffic)
  }

  // Save store data
  const handleSaveNewData = async () => {
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

  // Save external location
  const handleSaveExternalLocation = () => {
    if (!externalLocation) return

    setIsCreateMode(true)
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
    setExternalLocation(null)
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

  // Prepare route destinations for the map
const filteredDataByDay = useMemo(() => 
  Array.isArray(data) ? data.filter((item) => item.day === selectedDay) : []
, [data, selectedDay])

const filteredDataBySearch = useMemo(() =>
  Array.isArray(filteredDataByDay) ? filteredDataByDay.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.owner_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : []
, [filteredDataByDay, searchQuery])

  const routeDestinations = useMemo(() => {
    if (!showRouteView || !selectedItem) return []

    // Get all stores for the selected day in the current route order
    return routeOrder
      .map((index) => filteredDataBySearch[index])
      .filter((item) => item && item.id !== selectedItem.id)
      .map((item) => ({
        lat: item.lat,
        lng: item.lng,
        name: item.name,
        address: item.location,
      }))
  }, [showRouteView, selectedItem, routeOrder, filteredDataBySearch])

  return (
    <div className="local-store-page">
      {/* Header with search and controls */}
      <div className="header-section">
        <div className="search-controls">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search by name, location or owner..."
              value={searchInput}
              onChange={handleSearchInput}
              disabled={isLoading}
              className="search-input"
              aria-label="Search stores"
            />
            {searchInput && (
              <button
                className="clear-search-btn"
                onClick={() => {
                  setSearchInput("")
                  setSearchQuery("")
                  setSelectedItem(null)
                  setExternalLocation(null)
                }}
                aria-label="Clear search"
              >
                <span aria-hidden="true">×</span>
              </button>
            )}
          </div>
          <div className="button-group">
            <button
              onClick={handleCreateNewData}
              disabled={isLoading}
              className="create-button"
              aria-label="Create new store"
            >
              <Plus size={16} />
              Create New Store
            </button>
            <button
              onClick={() => setShowArchived(!showArchived)}
              disabled={isLoading}
              className="archive-button"
              aria-label={showArchived ? "Hide archived stores" : "Show archived stores"}
            >
              <Archive size={16} />
              {showArchived ? "Hide Archived" : "Show Archived"}
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="main-content-container">
        <div
          className={`main-local-content ${
            selectedItem || externalLocation ? "view-mode" : isCreateMode || isEditMode ? "form-mode" : ""
          }`}
        >
          {/* Table section */}
          <StoreTable
            data={filteredDataBySearch}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            selectedItem={selectedItem}
            handleRowClick={handleRowClick}
            handleEditLocation={handleEditLocation}
            handleArchiveStore={handleArchiveStore}
            showArchived={showArchived}
            showReorderButtons={showReorderButtons}
            toggleReorderButtons={toggleReorderButtons}
            routeOrder={routeOrder}
            moveRouteUp={moveRouteUp}
            moveRouteDown={moveRouteDown}
            isLoading={isLoading}
            tableRef={tableRef}
          />

          {/* Details section */}
          {(selectedItem || externalLocation || isCreateMode || isEditMode) && (
            <div className="details-section">
              <div className={`details-card ${isCreateMode || isEditMode ? "form-mode" : ""}`}>
                <button className="close-btn" onClick={handleClosePopup} aria-label="Close">
                  <span aria-hidden="true">×</span>
                </button>

                {selectedItem && !isEditMode ? (
                  <StoreDetails
                    store={selectedItem}
                    markerPosition={markerPosition}
                    showRouteView={showRouteView}
                    showTraffic={showTraffic}
                    routeDestinations={routeDestinations}
                    handleToggleRouteView={handleToggleRouteView}
                    handleToggleTraffic={handleToggleTraffic}
                    handleEditLocation={handleEditLocation}
                    handleArchiveStore={handleArchiveStore}
                  />
                ) : isCreateMode || isEditMode ? (
                  <StoreForm
                    formData={formData}
                    handleFormInputChange={handleFormInputChange}
                    markerPosition={markerPosition}
                    handleMarkerPositionChange={handleMarkerPositionChange}
                    handleSaveNewData={handleSaveNewData}
                    handleClosePopup={handleClosePopup}
                    isEditMode={isEditMode}
                    isLoading={isLoading}
                  />
                ) : externalLocation ? (
                  <div>
                    <h2 className="external-title">{externalLocation.name}</h2>
                    <p className="external-location">External location found</p>
                    <div className="map-container">
                      <StoreMap
                        lat={externalLocation.lat}
                        lng={externalLocation.lng}
                        markerLabel={externalLocation.name.split(",")[0]}
                        markerAddress={externalLocation.name}
                      />
                    </div>
                    <div className="action-buttons">
                      <button
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps?q=${externalLocation.lat},${externalLocation.lng}`,
                            "_blank",
                          )
                        }
                        className="map-btn"
                        aria-label="Open in Google Maps"
                      >
                        <span className="icon">📍</span>
                        Open in Maps
                      </button>
                      <button
                        onClick={handleSaveExternalLocation}
                        className="save-location-btn"
                        aria-label="Save this location"
                      >
                        <span className="icon">💾</span>
                        Save This Location
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="loading-overlay" aria-live="polite" aria-busy="true">
          <div className="loading-spinner" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}
    </div>
  )
}

