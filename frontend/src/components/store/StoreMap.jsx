"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const StoreMap = ({
  lat,
  lng,
  onMarkerPositionChange,
  isDraggable = false,
  markerLabel = "",
  markerAddress = "",
  showRoutes = false,
  showTraffic = false,
  routeDestinations = [],
}) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const routingControlRef = useRef(null)

  // Initialize map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      // Create map instance
      mapInstanceRef.current = L.map(mapRef.current).setView([lat, lng], 15)

      // Add tile layer (map style)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapInstanceRef.current)

      // Create marker
      markerRef.current = L.marker([lat, lng], { draggable: isDraggable }).addTo(mapInstanceRef.current)

      // Add popup with label and address if provided
      if (markerLabel || markerAddress) {
        const popupContent = `
          <div>
            ${markerLabel ? `<strong>${markerLabel}</strong>` : ""}
            ${markerLabel && markerAddress ? "<br>" : ""}
            ${markerAddress ? markerAddress : ""}
          </div>
        `
        markerRef.current.bindPopup(popupContent).openPopup()
      }

      // Handle marker drag events if draggable
      if (isDraggable && onMarkerPositionChange) {
        markerRef.current.on("dragend", (e) => {
          const marker = e.target
          const position = marker.getLatLng()
          onMarkerPositionChange(position.lat, position.lng)
        })
      }

      // Add location button
      const locationButton = L.control({ position: "topright" })
      locationButton.onAdd = () => {
        const div = L.DomUtil.create("div", "leaflet-bar leaflet-control")
        div.innerHTML = `<a href="#" title="My Location" role="button" aria-label="My Location" style="display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; background: white; font-size: 18px;">📍</a>`
        div.onclick = (e) => {
          e.preventDefault()
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords
                mapInstanceRef.current.setView([latitude, longitude], 15)
                if (markerRef.current && isDraggable && onMarkerPositionChange) {
                  markerRef.current.setLatLng([latitude, longitude])
                  onMarkerPositionChange(latitude, longitude)
                }
              },
              (error) => {
                console.error("Error getting location:", error)
                alert("Unable to get your location. Please check your browser permissions.")
              },
            )
          } else {
            alert("Geolocation is not supported by your browser")
          }
          return false
        }
        return div
      }
      locationButton.addTo(mapInstanceRef.current)
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update marker position when lat/lng props change
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
      mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom())

      // Update popup content if label or address changed
      if (markerLabel || markerAddress) {
        const popupContent = `
          <div>
            ${markerLabel ? `<strong>${markerLabel}</strong>` : ""}
            ${markerLabel && markerAddress ? "<br>" : ""}
            ${markerAddress ? markerAddress : ""}
          </div>
        `
        markerRef.current.bindPopup(popupContent)
      }
    }
  }, [lat, lng, markerLabel, markerAddress])

  // Handle route display
  useEffect(() => {
    if (!mapInstanceRef.current || !showRoutes) {
      // Remove existing routing control if routes are not shown
      if (routingControlRef.current) {
        mapInstanceRef.current.removeControl(routingControlRef.current)
        routingControlRef.current = null
      }
      return
    }

    // Remove existing routing control
    if (routingControlRef.current) {
      mapInstanceRef.current.removeControl(routingControlRef.current)
      routingControlRef.current = null
    }

    // Add route if we have destinations
    if (routeDestinations && routeDestinations.length > 0) {
      // Create waypoints starting with current marker
      const waypoints = [L.latLng(lat, lng)]

      // Add destinations
      routeDestinations.forEach((dest) => {
        waypoints.push(L.latLng(dest.lat, dest.lng))
      })

      // Create routing control
      if (typeof L.Routing !== "undefined") {
        routingControlRef.current = L.Routing.control({
          waypoints,
          routeWhileDragging: false,
          showAlternatives: showTraffic,
          lineOptions: {
            styles: [
              { color: "#6366f1", opacity: 0.8, weight: 6 },
              { color: "white", opacity: 0.3, weight: 2 },
            ],
          },
          createMarker: () => null, // Don't create markers for waypoints
        }).addTo(mapInstanceRef.current)
      }
    }

    return () => {
      if (routingControlRef.current) {
        mapInstanceRef.current.removeControl(routingControlRef.current)
        routingControlRef.current = null
      }
    }
  }, [showRoutes, routeDestinations, lat, lng, showTraffic])

  return <div ref={mapRef} style={{ height: "100%", width: "100%" }} aria-label="Map" role="application" />
}

export default StoreMap

