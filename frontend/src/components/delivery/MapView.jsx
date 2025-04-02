"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-routing-machine"
import { toast } from "react-toastify"

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

// Custom marker icons
const createMarkerIcon = (status) => {
  const color =
    status === "delivered"
      ? "#10b981"
      : status === "in-transit"
        ? "#3b82f6"
        : status === "pending"
          ? "#f59e0b"
          : status === "cancelled"
            ? "#ef4444"
            : "#6b7280"

  return L.divIcon({
    className: "custom-marker-icon",
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

const MapView = ({
  deliveries = [],
  selectedDelivery = null,
  onSelectDelivery = () => {},
  showRoutes = false,
  selectedEmployee = null,
}) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})
  const routingControlRef = useRef(null)
  const [userLocation, setUserLocation] = useState(null)
  const [optimizedRoute, setOptimizedRoute] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    // Create map instance
    const map = L.map(mapRef.current).setView([16.638, 120.315], 13)

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })

          // Add user location marker
          const userMarker = L.marker([latitude, longitude], {
            icon: L.divIcon({
              className: "user-location-marker",
              html: '<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            }),
          }).addTo(map)

          userMarker.bindPopup("Your Location").openPopup()

          // Center map on user location
          map.setView([latitude, longitude], 13)
        },
        (error) => {
          console.error("Error getting user location:", error)
          toast.error("Could not get your location. Using default view.")
        },
      )
    }

    // Store map instance
    mapInstanceRef.current = map

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Add delivery markers
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => {
      map.removeLayer(marker)
    })
    markersRef.current = {}

    // Add new markers
    const bounds = L.latLngBounds()
    let hasValidCoordinates = false

    deliveries.forEach((delivery) => {
      if (!delivery.lat || !delivery.lng) return

      const { id, lat, lng, store_name, status, address, delivery_date, delivery_time, employee_name } = delivery

      // Create marker
      const marker = L.marker([lat, lng], {
        icon: createMarkerIcon(status),
      }).addTo(map)

      // Create popup
      const popupContent = `
        <div>
          <h3 class="font-bold">${store_name}</h3>
          <p>${address}</p>
          <p>Status: ${status.toUpperCase()}</p>
          <p>Date: ${delivery_date} at ${delivery_time}</p>
          ${employee_name ? `<p>Driver: ${employee_name}</p>` : ""}
        </div>
      `

      marker.bindPopup(popupContent)

      // Handle marker click
      marker.on("click", () => {
        onSelectDelivery(delivery)
      })

      // Highlight selected delivery
      if (selectedDelivery && selectedDelivery.id === id) {
        marker.openPopup()
      }

      // Store marker reference
      markersRef.current[id] = marker

      // Extend bounds
      bounds.extend([lat, lng])
      hasValidCoordinates = true
    })

    // Fit bounds if we have valid coordinates
    if (hasValidCoordinates) {
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [deliveries, selectedDelivery, onSelectDelivery])

  // Handle route planning
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !showRoutes) return

    // Remove existing routing control
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current)
      routingControlRef.current = null
    }

    // Filter deliveries by employee if selected
    const filteredDeliveries = selectedEmployee
      ? deliveries.filter((d) => d.employee_id === selectedEmployee)
      : deliveries

    // Get valid waypoints
    const waypoints = filteredDeliveries.filter((d) => d.lat && d.lng).map((d) => L.latLng(d.lat, d.lng))

    // Add user location as starting point if available
    if (userLocation) {
      waypoints.unshift(L.latLng(userLocation.lat, userLocation.lng))
    }

    // Create routing control if we have at least 2 waypoints
    if (waypoints.length >= 2) {
      routingControlRef.current = L.Routing.control({
        waypoints,
        routeWhileDragging: false,
        showAlternatives: false,
        fitSelectedRoutes: true,
        lineOptions: {
          styles: [
            { color: "#6366f1", opacity: 0.8, weight: 6 },
            { color: "white", opacity: 0.3, weight: 2 },
          ],
        },
        createMarker: () => {
          return null // Don't create markers for waypoints
        },
      }).addTo(map)
    } else {
      toast.info("Not enough valid locations to create a route")
    }

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current)
        routingControlRef.current = null
      }
    }
  }, [deliveries, showRoutes, selectedEmployee, userLocation])

  return (
    <div
      ref={mapRef}
      className="h-[400px] w-full rounded-lg shadow-md"
      role="region"
      aria-label="Delivery locations map"
    />
  )
}

export default MapView

