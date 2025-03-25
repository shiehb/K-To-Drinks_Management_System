import React, { useState, useEffect, useMemo } from "react";
import "../css/localstore.css";
import LeafletMapPopup from "../components/LeafletMapPopup";
import { toast } from "react-toastify";

const API_URL = 'http://127.0.0.1:8000/api';
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DEFAULT_LAT = 16.63614047965268;
const DEFAULT_LNG = 120.31339285476308;

const toastConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  pauseOnHover: true,
  draggable: true,
  style: {
    backgroundColor: '#fff1f1',
    color: '#007aad',
  },
};

export default function LocalStorePage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [externalLocation, setExternalLocation] = useState(null);
  const [markerPosition, setMarkerPosition] = useState({ 
    lat: DEFAULT_LAT, 
    lng: DEFAULT_LNG 
  });
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({ 
    name: "", 
    location: "", 
    lat: DEFAULT_LAT, 
    lng: DEFAULT_LNG, 
    owner_name: "", 
    email: "", 
    number: "",
    day: days[0]
  });
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [routeOrder, setRouteOrder] = useState([]);
  const [showReorderButtons, setShowReorderButtons] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStores = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/stores/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const stores = await response.json();
      setData(Array.isArray(stores) ? stores : []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load stores. Please try again.", toastConfig);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    const initUserLocation = async () => {
      try {
        if (navigator.geolocation) {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          const { latitude, longitude } = position.coords;
          const lat = latitude || DEFAULT_LAT;
          const lng = longitude || DEFAULT_LNG;
          
          setMarkerPosition({ lat, lng });
          setFormData(prev => ({ ...prev, lat, lng }));
        } else {
          throw new Error("Geolocation not supported");
        }
      } catch (err) {
        console.error("Location error:", err);
        toast.error("Unable to retrieve your location. Using default location.", toastConfig);
        setMarkerPosition({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
        setFormData(prev => ({ ...prev, lat: DEFAULT_LAT, lng: DEFAULT_LNG }));
      }
    };

    initUserLocation();
  }, []);

  useEffect(() => {
    const filtered = data.filter(item => 
      item.day === selectedDay &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.owner_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setRouteOrder(filtered.map((_, index) => index));
  }, [selectedDay, searchQuery, data]);

  const filteredDataByDay = useMemo(() => 
    data.filter(item => item.day === selectedDay), 
    [data, selectedDay]
  );

  const filteredDataBySearch = useMemo(() => 
    filteredDataByDay.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.owner_name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [filteredDataByDay, searchQuery]
  );

  const handleMarkerPositionChange = (lat, lng) => {
    if (isCreateMode || isEditMode) {
      const newLat = lat || DEFAULT_LAT;
      const newLng = lng || DEFAULT_LNG;
      setMarkerPosition({ lat: newLat, lng: newLng });
      setFormData(prev => ({ ...prev, lat: newLat, lng: newLng }));
    }
  };

  const handleRowClick = (item) => {
    setSelectedItem(item);
    setMarkerPosition({ lat: item.lat, lng: item.lng });
    setIsCreateMode(false);
    setIsEditMode(false);
  };

  const handleClosePopup = () => {
    setSelectedItem(null);
    setExternalLocation(null);
    setIsCreateMode(false);
    setIsEditMode(false);
    setFormData({ 
      name: "", 
      location: "", 
      lat: markerPosition.lat, 
      lng: markerPosition.lng, 
      owner_name: "", 
      email: "", 
      number: "",
      day: selectedDay
    });
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query === "") {
      setSelectedItem(null);
      setExternalLocation(null);
      return;
    }

    try {
      const foundItem = data.find(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.location.toLowerCase().includes(query.toLowerCase()) ||
        item.owner_name.toLowerCase().includes(query.toLowerCase())
      );

      if (foundItem) {
        setSelectedItem(foundItem);
        setExternalLocation(null);
        setMarkerPosition({ lat: foundItem.lat, lng: foundItem.lng });
        return;
      }

      setIsLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const results = await response.json();

      if (results.length > 0) {
        const firstResult = results[0];
        setExternalLocation({
          name: firstResult.display_name,
          lat: parseFloat(firstResult.lat),
          lng: parseFloat(firstResult.lon),
        });
        setSelectedItem(null);
        setMarkerPosition({ 
          lat: parseFloat(firstResult.lat), 
          lng: parseFloat(firstResult.lon) 
        });
      } else {
        setExternalLocation(null);
      }
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Failed to search location. Please try again.", toastConfig);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewData = () => {
    setIsCreateMode(true);
    setIsEditMode(false);
    setSelectedItem(null);
    setExternalLocation(null);
    setFormData({ 
      name: "", 
      location: "", 
      lat: markerPosition.lat, 
      lng: markerPosition.lng, 
      owner_name: "", 
      email: "", 
      number: "",
      day: selectedDay
    });
  };

  const handleEditLocation = (item) => {
    setIsEditMode(true);
    setIsCreateMode(false);
    setSelectedItem(item);
    setExternalLocation(null);
    setFormData({ 
      name: item.name, 
      location: item.location, 
      lat: item.lat, 
      lng: item.lng,
      owner_name: item.owner_name,
      email: item.email,
      number: item.number,
      day: item.day
    });
    setMarkerPosition({ lat: item.lat, lng: item.lng });
  };

  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const requiredFields = ['name', 'location', 'lat', 'lng', 'owner_name', 'number'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(', ')}`, toastConfig);
      return false;
    }

    if (isNaN(formData.lat) || isNaN(formData.lng)) {
      toast.error("Coordinates must be valid numbers", toastConfig);
      return false;
    }

    if (formData.lat < -90 || formData.lat > 90 || formData.lng < -180 || formData.lng > 180) {
      toast.error("Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.", toastConfig);
      return false;
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error("Please enter a valid email address.", toastConfig);
      return false;
    }

    if (!/^[0-9+]+$/.test(formData.number)) {
      toast.error("Contact number should contain only numbers and + sign", toastConfig);
      return false;
    }

    return true;
  };

  const handleSaveNewData = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      let url, method;
      
      if (isEditMode) {
        url = `${API_URL}/stores/${selectedItem.id}/`;
        method = "PUT";
      } else {
        url = `${API_URL}/stores/`;
        method = "POST";
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to save store");
      }

      await fetchStores();
      handleClosePopup();
      toast.success(`Store ${isEditMode ? "updated" : "created"} successfully!`, toastConfig);
    } catch (err) {
      console.error("Save error:", err);
      toast.error(`Failed to save store: ${err.message}`, toastConfig);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStore = async (id) => {
    if (!window.confirm("Are you sure you want to delete this store?")) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/stores/${id}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete store");
      }

      await fetchStores();
      toast.success("Store deleted successfully!", toastConfig);
      handleClosePopup();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(`Failed to delete store: ${err.message}`, toastConfig);
    } finally {
      setIsLoading(false);
    }
  };

  const moveRouteUp = (index) => {
    if (index > 0 && routeOrder.length > 1) {
      const newOrder = [...routeOrder];
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      setRouteOrder(newOrder);
    }
  };

  const moveRouteDown = (index) => {
    if (index < routeOrder.length - 1 && routeOrder.length > 1) {
      const newOrder = [...routeOrder];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      setRouteOrder(newOrder);
    }
  };

  const toggleReorderButtons = () => {
    setShowReorderButtons(!showReorderButtons);
  };

  const formatCoordinate = (coord) => {
    return typeof coord === 'number' ? coord.toFixed(6) : 'N/A';
  };

  return (
    <div className="local-store-page">
      <div className="search-controls">
        <input
          type="text"
          placeholder="Search by name, location or owner..."
          value={searchQuery}
          onChange={handleSearch}
          aria-label="Search for a location"
          disabled={isLoading}
        />
        <button 
          onClick={handleCreateNewData} 
          className="create-btn"
          aria-label="Create new location"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Create New Store"}
        </button>
      </div>

      <div className={`main-local-content ${
        selectedItem && !isEditMode ? "view-mode" : 
        isCreateMode || isEditMode ? "form-mode" : ""
      }`}>
        <div className="table-section">
          <div className="table-controls">
            <div className="day-filter">
              <label htmlFor="day-select">Filter by Day:</label>
              <select
                id="day-select"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
              >
                {days.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={toggleReorderButtons} 
              className="reorder-toggle"
            >
              {showReorderButtons ? "Hide Arrange" : "Arrange Route"}
            </button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Store Name</th>
                  <th>Location</th>
                  {showReorderButtons && <th>Route Arrange</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDataBySearch.length > 0 ? (
                  routeOrder.map((orderIndex, index) => {
                    const item = filteredDataBySearch[orderIndex];
                    return (
                      <tr 
                        key={item.id} 
                        onClick={() => handleRowClick(item)}
                        className={selectedItem?.id === item.id ? "selected-row" : ""}
                      >
                        <td>{index + 1}</td>
                        <td>{item.name}</td>
                        <td>{item.location}</td>
                        {showReorderButtons && (
                          <td className="reorder-buttons">
                            <button 
                              onClick={(e) => { e.stopPropagation(); moveRouteUp(index); }}
                              disabled={index === 0}
                              aria-label="Move up"
                            >
                              ↑
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); moveRouteDown(index); }}
                              disabled={index === routeOrder.length - 1}
                              aria-label="Move down"
                            >
                              ↓
                            </button>
                          </td>
                        )}
                        <td className="actions-cell">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEditLocation(item); }}
                            className="edit-btn"
                            disabled={isLoading}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteStore(item.id); }}
                            className="delete-btn"
                            disabled={isLoading}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={showReorderButtons ? 5 : 4}>No stores found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {(selectedItem || externalLocation || isCreateMode || isEditMode) && (
          <div className="details-section">
            <div className={`details-card ${isCreateMode || isEditMode ? "form-mode" : ""}`}>
              <button className="close-btn" onClick={handleClosePopup} aria-label="Close">×</button>
              
              {selectedItem && !isEditMode ? (
                <>
                  <h2>{selectedItem.name}</h2>
                  <div className="location-info">
                    <p>{selectedItem.location}</p>
                    <p><strong>Owner:</strong> {selectedItem.owner_name}</p>
                    <p><strong>Contact:</strong> {selectedItem.number}</p>
                    {selectedItem.email && <p><strong>Email:</strong> {selectedItem.email}</p>}
                    <p><strong>Day:</strong> {selectedItem.day}</p>
                  </div>
                  <div className="map-container">
                    <LeafletMapPopup lat={selectedItem.lat} lng={selectedItem.lng} />
                  </div>
                  <div className="action-buttons">
                    <button 
                      className="action-btn maps-btn"
                      onClick={() => window.open(`https://www.google.com/maps?q=${selectedItem.lat},${selectedItem.lng}`, "_blank")}
                    >
                      Open in Google Maps
                    </button>
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => handleEditLocation(selectedItem)}
                      disabled={isLoading}
                    >
                      Edit Store
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteStore(selectedItem.id)}
                      disabled={isLoading}
                    >
                      Delete Store
                    </button>
                  </div>
                </>
              ) : (isCreateMode || isEditMode) ? (
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
                          placeholder="Enter store name"
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
                          placeholder="Enter address"
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
                          placeholder="Enter owner's name"
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
                          placeholder="e.g. 09123456789"
                          pattern="[0-9+]+"
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleFormInputChange}
                          placeholder="e.g. owner@example.com"
                        />
                      </div>
                      <div className="form-group">
                        <label>Day *</label>
                        <select
                          name="day"
                          value={formData.day}
                          onChange={handleFormInputChange}
                          required
                        >
                          {days.map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="map-column">
                      <div className="map-container">
                        {markerPosition.lat && markerPosition.lng ? (
                          <LeafletMapPopup 
                          lat={markerPosition.lat} 
                          lng={markerPosition.lng}
                          onMarkerPositionChange={handleMarkerPositionChange}
                          onMapTripleClick={handleMarkerPositionChange}
                          isDraggable={isCreateMode || isEditMode}
                          />
                        ) : (
                          <div className="map-loading">Loading map...</div>
                        )}
                      </div>
                      <div className="coordinates">
                        <p>Lat: {formatCoordinate(markerPosition.lat)}</p>
                        <p>Lng: {formatCoordinate(markerPosition.lng)}</p>
                        <button
                          className="action-btn maps-btn"
                          onClick={() => {
                            if (typeof formData.lat === 'number' && typeof formData.lng === 'number') {
                              window.open(`https://www.google.com/maps?q=${formData.lat},${formData.lng}`, "_blank");
                            } else {
                              toast.error("Coordinates are not valid", toastConfig);
                            }
                          }}
                          disabled={!formData.lat || !formData.lng}
                        >
                          Preview in Maps
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="action-btn save-btn" onClick={handleSaveNewData} disabled={isLoading}>
                      {isLoading ? "Saving..." : (isEditMode ? "Save Changes" : "Save Store")}
                    </button>
                    <button className="action-btn cancel-btn" onClick={handleClosePopup} disabled={isLoading}>
                      Cancel
                    </button>
                    {isEditMode && (
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteStore(selectedItem.id)}
                        disabled={isLoading}
                      >
                        Delete Store
                      </button>
                    )}
                  </div>
                </>
              ) : externalLocation ? (
                <>
                  <h2>{externalLocation.name}</h2>
                  <p className="external-location">External location from OpenStreetMap</p>
                  <div className="map-container">
                    <LeafletMapPopup lat={externalLocation.lat} lng={externalLocation.lng} />
                  </div>
                  <div className="action-buttons">
                    <button
                      className="action-btn maps-btn"
                      onClick={() => window.open(
                        `https://www.google.com/maps?q=${externalLocation.lat},${externalLocation.lng}`,
                        "_blank"
                      )}
                    >
                      Open in Google Maps
                    </button>
                    <button
                      className="action-btn save-btn"
                      onClick={() => {
                        setFormData({
                          name: externalLocation.name.split(',')[0],
                          location: externalLocation.name,
                          lat: externalLocation.lat,
                          lng: externalLocation.lng,
                          owner_name: "",
                          email: "",
                          number: "",
                          day: selectedDay
                        });
                        setIsCreateMode(true);
                        setExternalLocation(null);
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
  );
}