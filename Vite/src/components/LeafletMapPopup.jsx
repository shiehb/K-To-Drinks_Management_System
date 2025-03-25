import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const containerStyle = {
  width: "100%",
  height: "320px",
};

export default function LeafletMapPopup({ lat, lng, onMarkerPositionChange, isDraggable }) {
  const [markerPosition, setMarkerPosition] = useState([lat, lng]);
  const mapRef = useRef(null); // Ref to the MapContainer

  // Update marker position when lat/lng props change
  useEffect(() => {
    if (mapRef.current && lat && lng) {
      setMarkerPosition([lat, lng]);
      mapRef.current.setView([lat, lng], mapRef.current.getZoom()); // Center the map on the marker
    }
  }, [lat, lng]);

  // Function to handle marker drag end
  const handleMarkerDragEnd = (e) => {
    const newPosition = e.target.getLatLng();
    setMarkerPosition([newPosition.lat, newPosition.lng]); // Update local state
    if (onMarkerPositionChange) {
      onMarkerPositionChange(newPosition.lat, newPosition.lng); // Pass new position to parent
    }
  };

  return (
    <MapContainer
      center={markerPosition}
      zoom={100}
      style={containerStyle}
      ref={mapRef} // Attach the ref to the MapContainer
      whenCreated={(map) => {
        mapRef.current = map; // Store the map instance in the ref
        setMarkerPosition([lat, lng]); // Set initial marker position
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker
        position={markerPosition}
        draggable={isDraggable} // Enable/disable dragging based on isDraggable prop
        eventHandlers={{
          dragend: handleMarkerDragEnd, // Handle marker drag end event
        }}
      >
        <Popup>
          Latitude: {markerPosition[0]}, Longitude: {markerPosition[1]}
        </Popup>
      </Marker>
    </MapContainer>
  );
}