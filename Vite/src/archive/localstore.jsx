// LocalStorePage.jsx
import React, { useState, useEffect, useMemo } from "react";
import "../css/localstore.css";
import LeafletMapPopup from "../components/LeafletMapPopup";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const initialData = [
  { 
    id: 1, 
    name: "Saint Louis College La Union", 
    location: "Supplier ti coke ni sir FJ", 
    lat: 16.6369502, 
    lng: 120.3131961, 
    day: "Monday",
    owner_name: "Juan Dela Cruz",
    email: "juan@example.com",
    number: "09123456789"
  },
  { 
    id: 2, 
    name: "McDonald's SLC La Union", 
    location: "Fast Food Restaurant", 
    lat: 16.63555453298626, 
    lng: 120.31237436524712, 
    day: "Tuesday",
    owner_name: "Maria Santos",
    email: "maria@example.com",
    number: "09234567890"
  }
  // Add more sample data as needed
];

export default function LocalStorePage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [externalLocation, setExternalLocation] = useState(null);
  const [markerPosition, setMarkerPosition] = useState({ lat: null, lng: null });
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [data, setData] = useState(initialData);
  const [formData, setFormData] = useState({ 
    name: "", 
    location: "", 
    lat: "", 
    lng: "", 
    owner_name: "", 
    email: "", 
    number: "",
    day: days[0]
  });
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [routeOrder, setRouteOrder] = useState([]);
  const [showReorderButtons, setShowReorderButtons] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initUserLocation = async () => {
      try {
        if (navigator.geolocation) {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          const { latitude, longitude } = position.coords;
          setMarkerPosition({ lat: latitude, lng: longitude });
          setFormData(prev => ({ ...prev, lat: latitude, lng: longitude }));
        } else {
          throw new Error("Geolocation not supported");
        }
      } catch (err) {
        console.error("Location error:", err);
        setError("Unable to retrieve your location. Using default location.");
        const defaultPos = { lat: 16.6369502, lng: 120.3131961 };
        setMarkerPosition(defaultPos);
        setFormData(prev => ({ ...prev, lat: defaultPos.lat, lng: defaultPos.lng }));
      }
    };

    initUserLocation();
  }, []);

  useEffect(() => {
    const filtered = data.filter(item => 
      item.day === selectedDay &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setRouteOrder(filtered.map((_, index) => index));
  }, [selectedDay, searchQuery, data]);

  const filteredDataByDay = useMemo(() => 
    data.filter(item => item.day === selectedDay), 
    [data, selectedDay]
  );

  const filteredDataBySearch = useMemo(() => 
    filteredDataByDay.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [filteredDataByDay, searchQuery]
  );

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
      lat: "", 
      lng: "", 
      owner_name: "", 
      email: "", 
      number: "",
      day: selectedDay
    });
  };

  const handleSearch = async (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setSelectedItem(null);
      setExternalLocation(null);
      return;
    }

    try {
      const foundItem = data.find(item =>
        item.name.toLowerCase().includes(query)
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
      setError("Failed to search location. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkerPositionChange = (lat, lng) => {
    if (isCreateMode || isEditMode) {
      setMarkerPosition({ lat, lng });
      setFormData(prev => ({ ...prev, lat, lng }));
    }
  };

  const handleCreateNewData = () => {
    setIsCreateMode(true);
    setSelectedItem(null);
    setExternalLocation(null);
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

  const handleEditLocation = (item) => {
    setIsEditMode(true);
    setSelectedItem(item);
    setExternalLocation(null);
    setIsCreateMode(false);
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
      setError(`Missing required fields: ${missingFields.join(', ')}`);
      return false;
    }

    if (formData.lat < -90 || formData.lat > 90 || formData.lng < -180 || formData.lng > 180) {
      setError("Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.");
      return false;
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    setError(null);
    return true;
  };

  const handleSaveNewData = () => {
    if (!validateForm()) return;

    try {
      if (isCreateMode) {
        const newItem = {
          id: Math.max(...data.map(item => item.id), 0) + 1,
          ...formData,
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng)
        };
        setData([...data, newItem]);
      } else if (isEditMode) {
        const updatedData = data.map(item =>
          item.id === selectedItem.id
            ? { ...item, ...formData, lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) }
            : item
        );
        setData(updatedData);
      }

      handleClosePopup();
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save data. Please try again.");
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

  return (
    <div className="local-store-page">
      {error && <div className="error-message">{error}</div>}

      <div className="search-controls">
        <input
          type="text"
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={handleSearch}
          aria-label="Search for a location"
          disabled={isLoading}
        />
        <button 
          onClick={handleCreateNewData} 
          className="create-btn"
          aria-label="Create new location"
        >
          {isLoading ? "Loading..." : "Create New Location"}
        </button>
      </div>

      <div className={`main-local-content ${
  (selectedItem || externalLocation || isCreateMode || isEditMode) ? "two-column hide-table" : ""
}`}>
        {/* LEFT COLUMN - TABLE */}
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
                      <tr key={item.id} onClick={() => handleRowClick(item)}>
                        <td>{index + 1}</td>
                        <td>{item.name}</td>
                        <td>{item.location}</td>
                        {showReorderButtons && (
                          <td className="reorder-buttons">
                            <button 
                              onClick={(e) => { e.stopPropagation(); moveRouteUp(index); }}
                              disabled={index === 0}
                            >
                              ↑
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); moveRouteDown(index); }}
                              disabled={index === routeOrder.length - 1}
                            >
                              ↓
                            </button>
                          </td>
                        )}
                        <td>
                          <button onClick={(e) => { e.stopPropagation(); handleEditLocation(item); }}>
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={showReorderButtons ? 5 : 4}>No results found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN - MAP/DETAILS */}
        {(selectedItem || externalLocation || isCreateMode || isEditMode) && (
          <div className="details-section">
            <div className={`details-card ${isCreateMode || isEditMode ? "form-mode" : ""}`}>
              <button className="close-btn" onClick={handleClosePopup}>×</button>
              
              {selectedItem && !isEditMode ? (
                <>
                  <h2>{selectedItem.name}</h2>
                  <div className="location-info">
                    <p>{selectedItem.location}</p>
                    <p><strong>Owner:</strong> {selectedItem.owner_name}</p>
                    <p><strong>Contact:</strong> {selectedItem.number}</p>
                    {selectedItem.email && <p><strong>Email:</strong> {selectedItem.email}</p>}
                  </div>
                  <div className="map-container">
                    <LeafletMapPopup lat={selectedItem.lat} lng={selectedItem.lng} />
                  </div>
                  <button 
                    className="action-btn maps-btn"
                    onClick={() => window.open(`https://www.google.com/maps?q=${selectedItem.lat},${selectedItem.lng}`, "_blank")}
                  >
                    Open in Google Maps
                  </button>
                </>
              ) : isCreateMode || isEditMode ? (
                <>
                  <h2>{isEditMode ? "Edit Location" : "Create New Location"}</h2>
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
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleFormInputChange}
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
                        <LeafletMapPopup 
                          lat={markerPosition.lat} 
                          lng={markerPosition.lng}
                          onMarkerPositionChange={handleMarkerPositionChange}
                          isDraggable={true}
                        />
                      </div>
                      <div className="coordinates">
                        <button
                          className="action-btn maps-btn"
                          onClick={() => window.open(`https://www.google.com/maps?q=${formData.lat},${formData.lng}`, "_blank")}
                        >
                          Preview in Maps
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="action-btn save-btn" onClick={handleSaveNewData}>
                      {isEditMode ? "Save Changes" : "Save Location"}
                    </button>
                    <button className="action-btn cancel-btn" onClick={handleClosePopup}>
                      Cancel
                    </button>
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