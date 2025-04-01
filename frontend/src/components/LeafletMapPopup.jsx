"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

// Material-UI imports
import Button from "@mui/material/Button"
import ZoomInIcon from "@mui/icons-material/ZoomIn"
import MyLocationIcon from "@mui/icons-material/MyLocation"
import RoadIcon from "@mui/icons-material/Directions"
import RouteIcon from "@mui/icons-material/Route"
import Tooltip from "@mui/material/Tooltip"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import CircularProgress from "@mui/material/CircularProgress"
import Snackbar from "@mui/material/Snackbar"
import Alert from "@mui/material/Alert"

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const containerStyle = {
  width: "100%",
  height: "320px",
}

// Custom CSS to override cursor behavior
const mapCursorStyle = `
  .leaflet-container {
    cursor: default !important;
  }
  .leaflet-container.leaflet-drag-target {
    cursor: grabbing !important;
  }
  .leaflet-marker-icon {
    cursor: pointer !important;
  }
  .leaflet-popup-close-button {
    cursor: pointer !important;
  }
  .leaflet-control-zoom a {
    cursor: pointer !important;
  }
  .marker-popup {
    padding: 8px;
    font-size: 14px;
    max-width: 200px;
    word-wrap: break-word;
  }
  .marker-popup strong {
    display: block;
    margin-bottom: 4px;
    font-size: 16px;
    color: #c23a22;
  }
  .route-info-box {
    background: white;
    border-radius: 4px;
    padding: 6px 10px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    font-size: 12px;
    font-weight: bold;
    border: 1px solid #ccc;
    pointer-events: none;
    z-index: 1000;
    position: absolute;
    white-space: nowrap;
  }
  .route-info-box .time {
    color: #c23a22;
    font-size: 14px;
  }
  .route-info-box .distance {
    color: #333;
  }
  
  /* Pulse animation for live location */
  .pulse-marker {
    position: relative;
    width: 24px;
    height: 24px;
  }
  
  .pulse-marker-inner {
    position: absolute;
    width: 12px;
    height: 12px;
    background-color: #4285F4;
    border: 2px solid white;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  }
  
  .pulse-marker-outer {
    position: absolute;
    width: 24px;
    height: 24px;
    background-color: rgba(66, 133, 244, 0.4);
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: pulse 2s infinite;
    z-index: 1;
  }
  
  @keyframes pulse {
    0% {
      transform: translate(-50%, -50%) scale(0.5);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.5);
      opacity: 0;
    }
  }
`

// Create custom star marker icon
const createStarMarker = (color = "#FFC107") => {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path fill="${color}" stroke="#000" strokeWidth="0.5" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>`,
    className: "star-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

// Create custom destination marker icon
const createDestinationMarker = (color = "#F44336") => {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path fill="${color}" stroke="#000" strokeWidth="0.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>`,
    className: "destination-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

// Create custom origin marker icon
const createOriginMarker = (color = "#4CAF50") => {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="${color}" stroke="#000" strokeWidth="0.5"/>
      <circle cx="12" cy="12" r="5" fill="white" stroke="#000" strokeWidth="0.5"/>
    </svg>`,
    className: "origin-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

// Create custom live location marker icon
const createLiveLocationMarker = () => {
  return L.divIcon({
    html: `<div class="pulse-marker">
      <div class="pulse-marker-inner"></div>
      <div class="pulse-marker-outer"></div>
    </div>`,
    className: "live-location-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

// Create custom pin marker icon
const createPinMarker = (color = "#3F51B5") => {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
      <path fill="${color}" stroke="#000" strokeWidth="0.5" d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      <circle cx="12" cy="7" r="2.5" fill="white" stroke="#000" strokeWidth="0.3"/>
    </svg>`,
    className: "pin-marker",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  })
}

function MapEvents({ onMapClick, onMapLongPress }) {
  const pressTimer = useRef(null)
  const pressStartPosition = useRef(null)
  const [isPressing, setIsPressing] = useState(false)

  useMapEvents({
    mousedown: (e) => {
      // Start timer for long press
      pressStartPosition.current = e.latlng
      setIsPressing(true)

      pressTimer.current = setTimeout(() => {
        if (pressStartPosition.current && onMapLongPress) {
          onMapLongPress(pressStartPosition.current.lat, pressStartPosition.current.lng)
        }
        setIsPressing(false)
        pressStartPosition.current = null
      }, 500) // 500ms for long press
    },
    mouseup: (e) => {
      // Clear timer if mouse is released before long press threshold
      if (pressTimer.current) {
        clearTimeout(pressTimer.current)
      }

      // If it was a short press/click and positions match (not a drag)
      if (isPressing && pressStartPosition.current) {
        const distance = e.latlng.distanceTo(pressStartPosition.current)
        if (distance < 10 && onMapClick) {
          // 10 pixels tolerance
          onMapClick(e.latlng.lat, e.latlng.lng)
        }
      }

      setIsPressing(false)
      pressStartPosition.current = null
    },
    mousemove: (e) => {
      // Cancel long press if mouse moves too much
      if (isPressing && pressStartPosition.current) {
        const distance = e.latlng.distanceTo(pressStartPosition.current)
        if (distance > 10) {
          // 10 pixels tolerance
          if (pressTimer.current) {
            clearTimeout(pressTimer.current)
          }
          setIsPressing(false)
          pressStartPosition.current = null
        }
      }
    },
    mouseout: () => {
      // Cancel long press if mouse leaves the map
      if (pressTimer.current) {
        clearTimeout(pressTimer.current)
      }
      setIsPressing(false)
      pressStartPosition.current = null
    },
  })

  return null
}

// Route info component
function RouteInfoBox({ position, time, distance }) {
  return (
    <div
      className="route-info-box"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="time">{time} min</div>
      <div className="distance">{distance} km</div>
    </div>
  )
}

export default function LeafletMapPopup({
  lat,
  lng,
  onMarkerPositionChange,
  isDraggable,
  markerLabel,
  markerAddress,
  showRoutes = false,
  showTraffic = false,
  routeDestinations = [],
}) {
  const [markerPosition, setMarkerPosition] = useState([lat, lng])
  const [isLocating, setIsLocating] = useState(false)
  const [isSnapping, setIsSnapping] = useState(false)
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" })
  const mapRef = useRef(null)
  const [routes, setRoutes] = useState([])
  const [routeInfoBoxes, setRouteInfoBoxes] = useState([])
  const [liveLocationMarker, setLiveLocationMarker] = useState(null)

  // Custom marker icons
  const destinationIcon = useMemo(() => createDestinationMarker(), [])
  const originIcon = useMemo(() => createOriginMarker(), [])
  const waypointIcon = useMemo(() => createStarMarker(), [])

  const customIcon = useMemo(() => {
    return isDraggable ? originIcon : destinationIcon
  }, [isDraggable, originIcon, destinationIcon])

  // Add CSS to document head
  useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.textContent = mapCursorStyle
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  useEffect(() => {
    if (mapRef.current && lat && lng) {
      setMarkerPosition([lat, lng])
      mapRef.current.setView([lat, lng], mapRef.current.getZoom())
    }
  }, [lat, lng])

  // Calculate routes when destinations change
  useEffect(() => {
    if (showRoutes && routeDestinations.length > 0 && mapRef.current) {
      calculateRoutes()
    }
  }, [showRoutes, routeDestinations, markerPosition])

  const calculateRoutes = async () => {
    if (!showRoutes || routeDestinations.length === 0) return

    setIsCalculatingRoute(true)
    try {
      const newRoutes = []
      const newInfoBoxes = []

      // Origin point (current marker)
      let origin = markerPosition

      // For each destination, calculate a route
      for (let i = 0; i < routeDestinations.length; i++) {
        const destination = [routeDestinations[i].lat, routeDestinations[i].lng]

        // Simulate route calculation (in a real app, you'd use a routing API)
        const route = simulateRoute(origin, destination)

        // Calculate route info
        const distance = calculateDistance(origin[0], origin[1], destination[0], destination[1])
        const time = Math.round(distance * 2) // Rough estimate: 2 min per km

        // Find midpoint of route for info box
        const midIndex = Math.floor(route.length / 2)
        const midpoint = route[midIndex]

        if (mapRef.current && midpoint) {
          const point = mapRef.current.latLngToContainerPoint(L.latLng(midpoint[0], midpoint[1]))

          newInfoBoxes.push({
            position: { x: point.x, y: point.y },
            time: time,
            distance: distance.toFixed(1),
          })
        }

        newRoutes.push({
          path: route,
          color: i === 0 ? "#4285F4" : "#FFA000", // Blue for first route, amber for others
          weight: 5,
        })

        // Update origin for next route segment
        origin = destination
      }

      setRoutes(newRoutes)
      setRouteInfoBoxes(newInfoBoxes)
    } catch (error) {
      console.error("Route calculation error:", error)
      showSnackbar("Failed to calculate routes", "error")
    } finally {
      setIsCalculatingRoute(false)
    }
  }

  // Simulate a route between two points (in a real app, use a routing API)
  const simulateRoute = (start, end) => {
    // Create a more realistic road-like path with curves and segments
    const numMainPoints = 4 // Number of main waypoints
    const pointsPerSegment = 5 // Points to interpolate between main waypoints
    const route = []

    // Generate main waypoints with more significant deviation from straight line
    const mainPoints = []
    mainPoints.push(start)

    for (let i = 1; i < numMainPoints; i++) {
      const ratio = i / numMainPoints
      const directLat = start[0] + (end[0] - start[0]) * ratio
      const directLng = start[1] + (end[1] - start[1]) * ratio

      // Create more significant deviation to simulate roads
      const perpFactor = Math.sin(ratio * Math.PI) // Peak deviation in the middle
      const distance = calculateDistance(start[0], start[1], end[0], end[1])
      const jitterScale = distance * 0.05 // Scale jitter based on distance

      // Perpendicular offset to create curved path
      const dx = end[1] - start[1]
      const dy = end[0] - start[0]
      const norm = Math.sqrt(dx * dx + dy * dy)

      // Random side of the direct path
      const side = Math.random() > 0.5 ? 1 : -1

      if (norm > 0) {
        const offsetLat = directLat + side * perpFactor * jitterScale * (-dx / norm)
        const offsetLng = directLng + side * perpFactor * jitterScale * (dy / norm)
        mainPoints.push([offsetLat, offsetLng])
      } else {
        mainPoints.push([directLat, directLng])
      }
    }

    mainPoints.push(end)

    // Interpolate between main waypoints to create smooth path
    for (let i = 0; i < mainPoints.length - 1; i++) {
      const segStart = mainPoints[i]
      const segEnd = mainPoints[i + 1]

      for (let j = 0; j <= pointsPerSegment; j++) {
        const ratio = j / pointsPerSegment
        const lat = segStart[0] + (segEnd[0] - segStart[0]) * ratio
        const lng = segStart[1] + (segEnd[1] - segStart[1]) * ratio

        // Add small jitter for natural look
        const smallJitter = j > 0 && j < pointsPerSegment ? (Math.random() - 0.5) * 0.0005 : 0

        route.push([lat + smallJitter, lng + smallJitter])
      }
    }

    return route
  }

  // Add a function to simulate traffic conditions
  const getTrafficCondition = (routeIndex, segmentIndex, totalSegments) => {
    // Simulate traffic conditions based on route and segment
    // Returns: 'low', 'medium', or 'high'

    // Use deterministic "random" based on indices to keep traffic consistent
    const seed = (routeIndex * 1000 + segmentIndex * 10) % 100

    // Make traffic more likely in the middle segments of routes
    const positionFactor = Math.sin((segmentIndex / totalSegments) * Math.PI)
    const trafficProbability = seed / 100 + positionFactor * 0.3

    if (trafficProbability > 0.7) return "high"
    if (trafficProbability > 0.4) return "medium"
    return "low"
  }

  // Calculate distance between two points in km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in km
    return distance
  }

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180)
  }

  const handleMapClick = (lat, lng) => {
    if (isDraggable) {
      updateMarkerPosition(lat, lng)
    }
  }

  const handleMapLongPress = (lat, lng) => {
    if (isDraggable) {
      updateMarkerPosition(lat, lng)
      showSnackbar("Location pinned", "success")
    }
  }

  const handleMarkerDragEnd = (e) => {
    const newPosition = e.target.getLatLng()
    updateMarkerPosition(newPosition.lat, newPosition.lng)
  }

  const updateMarkerPosition = (lat, lng) => {
    setMarkerPosition([lat, lng])
    if (onMarkerPositionChange) {
      onMarkerPositionChange(lat, lng)
    }
  }

  const zoomToMarker = () => {
    if (mapRef.current && markerPosition) {
      mapRef.current.flyTo(markerPosition, 18)
    }
  }

  const getCurrentLocationWithAccuracy = () => {
    if (!navigator.geolocation) {
      showSnackbar("Geolocation is not supported by your browser", "error")
      return
    }

    setIsLocating(true)

    // Options for high accuracy
    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords

        // Update marker position
        setMarkerPosition({ lat: latitude, lng: longitude })

        // Set live location marker
        setLiveLocationMarker({ lat: latitude, lng: longitude })

        // Fly to location
        mapRef.current.flyTo([latitude, longitude], 18)
        setIsLocating(false)
        showSnackbar("Your current location has been pinned", "success")

        // Try to get address from coordinates
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        )
          .then((response) => response.json())
          .then((data) => {
            if (data.display_name) {
              showSnackbar(`Location: ${data.display_name}`, "info")
            }
          })
          .catch((error) => console.error("Error fetching address:", error))
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable"
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out"
            break
        }
        showSnackbar(errorMessage, "error")
        setIsLocating(false)
      },
      options,
    )
  }

  const snapToNearestRoad = async () => {
    if (!markerPosition) return

    setIsSnapping(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${markerPosition[0]}&lon=${markerPosition[1]}`,
      )

      if (!response.ok) throw new Error("Network response failed")

      const data = await response.json()

      if (data.address?.road) {
        // If we found a road, use the original coordinates (reverse geocoding gives us the road)
        // For precise snapping, we'd need a more advanced API like OSRM's nearest service
        showSnackbar(`Pinned to ${data.address.road}`, "success")
      } else {
        // Fallback to using Overpass API to find nearest road
        await snapWithOverpassAPI()
      }
    } catch (error) {
      console.error("Snapping error:", error)
      showSnackbar("Failed to snap to road. Trying alternative method...", "warning")
      await snapWithOverpassAPI()
    } finally {
      setIsSnapping(false)
    }
  }

  const snapWithOverpassAPI = async () => {
    try {
      const overpassQuery = `[out:json];
        way(around:50,${markerPosition[0]},${markerPosition[1]})[highway];
        (._;>;);
        out body;`

      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`)

      if (!response.ok) throw new Error("Overpass API request failed")

      const data = await response.json()

      if (data.elements?.length > 0) {
        // Find the closest point on the nearest road
        const nearestRoad = data.elements.find((e) => e.type === "way")
        if (nearestRoad) {
          // In a real app, you'd calculate the closest point on the road geometry
          // For simplicity, we'll use the first node of the road
          const nodeId = nearestRoad.nodes[0]
          const node = data.elements.find((e) => e.id === nodeId)
          if (node) {
            updateMarkerPosition(node.lat, node.lon)
            mapRef.current.flyTo([node.lat, node.lon], 16)
            showSnackbar("Pinned to nearest road", "success")
            return
          }
        }
      }
      showSnackbar("No nearby roads found", "info")
    } catch (error) {
      console.error("Overpass API error:", error)
      showSnackbar("Failed to find nearby roads", "error")
    }
  }

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  const popupStyle = {
    ".marker-popup": {
      padding: "4px",
      fontSize: "14px",
      maxWidth: "200px",
      wordWrap: "break-word",
    },
    ".marker-popup strong": {
      display: "block",
      marginBottom: "4px",
      fontSize: "16px",
      color: "#c23a22",
    },
  }

  const getCurrentLocation = getCurrentLocationWithAccuracy

  return (
    <Box sx={{ position: "relative" }}>
      <MapContainer
        center={markerPosition}
        zoom={15}
        style={containerStyle}
        ref={mapRef}
        whenCreated={(map) => {
          mapRef.current = map
          setMarkerPosition([lat, lng])
        }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains={["a", "b", "c", "d"]}
          maxZoom={19}
        />

        {/* Main marker */}
        <Marker
          position={markerPosition}
          draggable={isDraggable}
          eventHandlers={{
            dragend: handleMarkerDragEnd,
          }}
          icon={isDraggable ? createPinMarker("#4CAF50") : createPinMarker("#F44336")}
        >
          <Popup>
            <div className="marker-popup">
              {markerLabel ? (
                <>
                  <strong>{markerLabel}</strong>
                  {markerAddress && <span>{markerAddress}</span>}
                </>
              ) : (
                <>
                  Latitude: {markerPosition[0]}, Longitude: {markerPosition[1]}
                </>
              )}
            </div>
          </Popup>
        </Marker>

        {/* Destination markers */}
        {showRoutes &&
          routeDestinations.map((dest, index) => (
            <Marker
              key={`dest-${index}`}
              position={[dest.lat, dest.lng]}
              icon={index === routeDestinations.length - 1 ? destinationIcon : waypointIcon}
            >
              <Popup>
                <div className="marker-popup">
                  <strong>{dest.name || `Destination ${index + 1}`}</strong>
                  {dest.address && <span>{dest.address}</span>}
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Route polylines */}
        {routes.map((route, index) => {
          if (showTraffic) {
            // Split route into segments with different traffic conditions
            const segments = []
            const segmentSize = Math.max(3, Math.floor(route.path.length / 8)) // At least 3 points per segment

            for (let i = 0; i < route.path.length - 1; i += segmentSize) {
              const end = Math.min(i + segmentSize, route.path.length)
              const segmentPath = route.path.slice(i, end)
              if (segmentPath.length > 1) {
                const traffic = getTrafficCondition(index, i / segmentSize, Math.ceil(route.path.length / segmentSize))
                segments.push({
                  path: segmentPath,
                  traffic: traffic,
                })
              }
            }

            return segments.map((segment, segIndex) => {
              // Color based on traffic
              let color = route.color
              let weight = route.weight
              let opacity = 0.8

              if (segment.traffic === "medium") {
                color = "#FFA000" // Amber for medium traffic
                weight = route.weight * 1.2
              } else if (segment.traffic === "high") {
                color = "#F44336" // Red for high traffic
                weight = route.weight * 1.5
                opacity = 1
              }

              return (
                <Polyline
                  key={`route-${index}-segment-${segIndex}`}
                  positions={segment.path}
                  color={color}
                  weight={weight}
                  opacity={opacity}
                />
              )
            })
          } else {
            // Regular route without traffic
            return <Polyline key={`route-${index}`} positions={route.path} color={route.color} weight={route.weight} />
          }
        })}

        <MapEvents onMapClick={handleMapClick} onMapLongPress={handleMapLongPress} />
        {liveLocationMarker && (
          <Marker position={[liveLocationMarker.lat, liveLocationMarker.lng]} icon={createLiveLocationMarker()}>
            <Popup>
              <div className="marker-popup">
                <strong>Your Location</strong>
                <span>This is your current location</span>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Route info boxes */}
      {routeInfoBoxes.map((infoBox, index) => (
        <RouteInfoBox
          key={`info-${index}`}
          position={infoBox.position}
          time={infoBox.time}
          distance={infoBox.distance}
        />
      ))}

      <Stack
        spacing={1}
        sx={{
          position: "absolute",
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
              minWidth: "auto",
              padding: "8px",
              color: "black",
              backgroundColor: "background.paper",
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            <ZoomInIcon fontSize="small" />
          </Button>
        </Tooltip>

        <Tooltip title="Find my location" arrow>
          <Button
            variant="contained"
            size="small"
            onClick={getCurrentLocationWithAccuracy}
            disabled={isLocating}
            sx={{
              minWidth: "auto",
              padding: "8px",
              color: "black",
              backgroundColor: "background.paper",
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            {isLocating ? <CircularProgress size={20} /> : <MyLocationIcon fontSize="small" />}
          </Button>
        </Tooltip>

        <Tooltip title="Snap to nearest road" arrow>
          <Button
            variant="contained"
            size="small"
            onClick={snapToNearestRoad}
            disabled={isSnapping}
            sx={{
              minWidth: "auto",
              padding: "8px",
              color: "black",
              backgroundColor: "background.paper",
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            {isSnapping ? <CircularProgress size={20} /> : <RoadIcon fontSize="small" />}
          </Button>
        </Tooltip>

        {showRoutes && (
          <Tooltip title="Calculate routes" arrow>
            <Button
              variant="contained"
              size="small"
              onClick={calculateRoutes}
              disabled={isCalculatingRoute || routeDestinations.length === 0}
              sx={{
                minWidth: "auto",
                padding: "8px",
                color: "black",
                backgroundColor: "background.paper",
                "&:hover": { backgroundColor: "action.hover" },
              }}
            >
              {isCalculatingRoute ? <CircularProgress size={20} /> : <RouteIcon fontSize="small" />}
            </Button>
          </Tooltip>
        )}
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

