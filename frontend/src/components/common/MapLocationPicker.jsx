"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const MapLocationPicker = ({
  lat,
  lng,
  onMarkerPositionChange,
  isDraggable = false,
  markerLabel = "",
  markerAddress = "",
  additionalMarkers = [],
  showSatellite = false,
  height = "100%",
}) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const additionalMarkersRef = useRef([])

  // Initialize map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      // Create map instance
      mapInstanceRef.current = L.map(mapRef.current).setView([lat, lng], 15)

      // Add tile layer (map style)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapInstanceRef.current)

      // Add satellite layer if requested
      if (showSatellite) {
        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        }).addTo(mapInstanceRef.current)
      }

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

      // Add layer toggle if satellite view is enabled
      if (showSatellite) {
        const baseMaps = {
          Street: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
          Satellite: L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ),
        }
        L.control.layers(baseMaps).addTo(mapInstanceRef.current)
      }
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

  // Handle additional markers
  useEffect(() => {
    if (mapInstanceRef.current) {
      // Remove existing additional markers
      additionalMarkersRef.current.forEach((marker) => {
        mapInstanceRef.current.removeLayer(marker)
      })
      additionalMarkersRef.current = []

      // Add new markers
      if (additionalMarkers && additionalMarkers.length > 0) {
        const bounds = L.latLngBounds()
        bounds.extend([lat, lng]) // Include main marker in bounds

        additionalMarkers.forEach((marker, index) => {
          if (marker.lat && marker.lng) {
            const newMarker = L.marker([marker.lat, marker.lng], {
              icon: L.divIcon({
                className: "custom-div-icon",
                html: `<div style="background-color: #3388ff; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              }),
            }).addTo(mapInstanceRef.current)

            // Add popup with info if available
            if (marker.name || marker.address) {
              const popupContent = `
                <div>
                  ${marker.name ? `<strong>${marker.name}</strong>` : ""}
                  ${marker.name && marker.address ? "<br>" : ""}
                  ${marker.address ? marker.address : ""}
                </div>
              `
              newMarker.bindPopup(popupContent)
            }

            additionalMarkersRef.current.push(newMarker)
            bounds.extend([marker.lat, marker.lng])
          }
        })

        // Fit map to show all markers if there are additional markers
        if (additionalMarkers.length > 0) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
        }
      }
    }
  }, [additionalMarkers, lat, lng])

  return <div ref={mapRef} style={{ height: height, width: "100%" }}></div>
}

export default MapLocationPicker

