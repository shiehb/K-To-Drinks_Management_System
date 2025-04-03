"use client"
import { MapPin, Edit, Archive, Navigation, AlertTriangle } from "lucide-react"
import StoreMap from "./StoreMap"

const StoreDetails = ({
  store,
  markerPosition,
  showRouteView,
  showTraffic,
  routeDestinations,
  handleToggleRouteView,
  handleToggleTraffic,
  handleEditLocation,
  handleArchiveStore,
}) => {
  return (
    <>
      <h2 className="store-title">{store.name}</h2>
      <div className="store-details">
        <div className="detail-item">
          <span className="detail-label">Location:</span>
          <span className="detail-value">{store.location}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Owner:</span>
          <span className="detail-value">{store.owner_name}</span>
        </div>

        <div className="contact-grid">
          <div className="detail-item">
            <span className="detail-label">Contact:</span>
            <span className="detail-value">{store.number}</span>
          </div>
          {store.email && (
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value email-value">{store.email}</span>
            </div>
          )}
        </div>

        <div className="detail-item">
          <span className="detail-label">Day:</span>
          <span className="detail-value">{store.day}</span>
        </div>
        {store.is_archived && <div className="archived-notice">This store is archived</div>}
      </div>
      <div className="map-container">
        <StoreMap
          lat={store.lat}
          lng={store.lng}
          markerLabel={store.name}
          markerAddress={store.location}
          showRoutes={showRouteView}
          showTraffic={showTraffic}
          routeDestinations={routeDestinations}
        />
      </div>
      <div className="action-buttons">
        <button
          onClick={() => window.open(`https://www.google.com/maps?q=${store.lat},${store.lng}`, "_blank")}
          className="map-btn"
          aria-label="Open in Google Maps"
        >
          <MapPin size={16} />
          Open in Maps
        </button>
        <button
          onClick={handleToggleRouteView}
          className={`route-btn ${showRouteView ? "active" : ""}`}
          aria-label={showRouteView ? "Hide route" : "Show route"}
          aria-pressed={showRouteView}
        >
          <Navigation size={16} />
          {showRouteView ? "Hide Route" : "Show Route"}
        </button>
        <button
          onClick={handleToggleTraffic}
          className={`traffic-btn ${showTraffic ? "active" : ""}`}
          disabled={!showRouteView}
          aria-label={showTraffic ? "Hide traffic" : "Show traffic"}
          aria-pressed={showTraffic}
        >
          <AlertTriangle size={16} />
          {showTraffic ? "Hide Traffic" : "Show Traffic"}
        </button>
        <button
          onClick={() => handleEditLocation(store)}
          disabled={store.is_archived}
          className="edit-store-btn"
          aria-label="Edit store"
        >
          <Edit size={16} />
          Edit Store
        </button>
        <button
          onClick={() => handleArchiveStore(store.id)}
          className="archive-store-btn"
          aria-label={store.is_archived ? "Unarchive store" : "Archive store"}
        >
          <Archive size={16} />
          {store.is_archived ? "Unarchive" : "Archive"}
        </button>
      </div>
    </>
  )
}

export default StoreDetails

