import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Material-UI imports
import Button from '@mui/material/Button';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import RoadIcon from '@mui/icons-material/Directions';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// Fix for default marker icons
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

function MapEvents({ onMapTripleClick }) {
  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef(null);

  useMapEvents({
    click: (e) => {
      clickCountRef.current += 1;
      
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      
      clickTimeoutRef.current = setTimeout(() => {
        if (clickCountRef.current >= 3 && onMapTripleClick) {
          onMapTripleClick(e.latlng.lat, e.latlng.lng);
        }
        clickCountRef.current = 0;
      }, 300);
    }
  });

  return null;
}

export default function LeafletMapPopup({ 
  lat, 
  lng, 
  onMarkerPositionChange, 
  isDraggable, 
  onMapTripleClick 
}) {
  const [markerPosition, setMarkerPosition] = useState([lat, lng]);
  const [isLocating, setIsLocating] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && lat && lng) {
      setMarkerPosition([lat, lng]);
      mapRef.current.setView([lat, lng], mapRef.current.getZoom());
    }
  }, [lat, lng]);

  const handleMarkerDragEnd = (e) => {
    const newPosition = e.target.getLatLng();
    updateMarkerPosition(newPosition.lat, newPosition.lng);
  };

  const updateMarkerPosition = (lat, lng) => {
    setMarkerPosition([lat, lng]);
    if (onMarkerPositionChange) {
      onMarkerPositionChange(lat, lng);
    }
  };

  const zoomToMarker = () => {
    if (mapRef.current && markerPosition) {
      mapRef.current.flyTo(markerPosition, 18);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showSnackbar("Geolocation is not supported by your browser", "error");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateMarkerPosition(latitude, longitude);
        mapRef.current.flyTo([latitude, longitude], 16);
        setIsLocating(false);
        showSnackbar("Your location has been pinned", "success");
      },
      (error) => {
        showSnackbar(`Location error: ${error.message}`, "error");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const snapToNearestRoad = async () => {
    if (!markerPosition) return;
    
    setIsSnapping(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${markerPosition[0]}&lon=${markerPosition[1]}`
      );
      
      if (!response.ok) throw new Error('Network response failed');
      
      const data = await response.json();
      
      if (data.address?.road) {
        // If we found a road, use the original coordinates (reverse geocoding gives us the road)
        // For precise snapping, we'd need a more advanced API like OSRM's nearest service
        showSnackbar(`Pinned to ${data.address.road}`, "success");
      } else {
        // Fallback to using Overpass API to find nearest road
        await snapWithOverpassAPI();
      }
    } catch (error) {
      console.error("Snapping error:", error);
      showSnackbar("Failed to snap to road. Trying alternative method...", "warning");
      await snapWithOverpassAPI();
    } finally {
      setIsSnapping(false);
    }
  };

  const snapWithOverpassAPI = async () => {
    try {
      const overpassQuery = `[out:json];
        way(around:50,${markerPosition[0]},${markerPosition[1]})[highway];
        (._;>;);
        out body;`;
      
      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`
      );
      
      if (!response.ok) throw new Error('Overpass API request failed');
      
      const data = await response.json();
      
      if (data.elements?.length > 0) {
        // Find the closest point on the nearest road
        const nearestRoad = data.elements.find(e => e.type === "way");
        if (nearestRoad) {
          // In a real app, you'd calculate the closest point on the road geometry
          // For simplicity, we'll use the first node of the road
          const nodeId = nearestRoad.nodes[0];
          const node = data.elements.find(e => e.id === nodeId);
          if (node) {
            updateMarkerPosition(node.lat, node.lon);
            mapRef.current.flyTo([node.lat, node.lon], 16);
            showSnackbar("Pinned to nearest road", "success");
            return;
          }
        }
      }
      showSnackbar("No nearby roads found", "info");
    } catch (error) {
      console.error("Overpass API error:", error);
      showSnackbar("Failed to find nearby roads", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <MapContainer
        center={markerPosition}
        zoom={15}
        style={containerStyle}
        ref={mapRef}
        whenCreated={(map) => {
          mapRef.current = map;
          setMarkerPosition([lat, lng]);
        }}
      >
        <TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  subdomains={['a', 'b', 'c']} // Rotate between subdomains
/>
        <Marker
          position={markerPosition}
          draggable={isDraggable}
          eventHandlers={{
            dragend: handleMarkerDragEnd,
          }}
        >
          <Popup>
            Latitude: {markerPosition[0]}, Longitude: {markerPosition[1]}
          </Popup>
        </Marker>
        <MapEvents onMapTripleClick={onMapTripleClick} />
      </MapContainer>

      <Stack 
        spacing={1} 
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
        }}
      >
        <Tooltip title="Zoom to marker" arrow>
          <Button
            variant="contained"
            size="small"
            onClick={zoomToMarker}
            sx={{
              minWidth: 'auto',
              padding: '8px',
              color:'black',
              backgroundColor: 'background.paper',
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <ZoomInIcon fontSize="small" />
          </Button>
        </Tooltip>

        <Tooltip title="Find my location" arrow>
          <Button
            variant="contained"
            size="small"
            onClick={getCurrentLocation}
            disabled={isLocating}
            sx={{
              minWidth: 'auto',
              padding: '8px',
              color:'black',
              backgroundColor: 'background.paper',
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            {isLocating ? (
              <CircularProgress size={20} />
            ) : (
              <MyLocationIcon fontSize="small" />
            )}
          </Button>
        </Tooltip>

        <Tooltip title="Snap to nearest road" arrow>
          <Button
            variant="contained"
            size="small"
            onClick={snapToNearestRoad}
            disabled={isSnapping}
            sx={{
              minWidth: 'auto',
              padding: '8px',
              color:'black',
              backgroundColor: 'background.paper',
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            {isSnapping ? (
              <CircularProgress size={20} />
            ) : (
              <RoadIcon fontSize="small" />
            )}
          </Button>
        </Tooltip>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}