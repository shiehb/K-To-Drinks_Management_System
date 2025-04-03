"use client"
import { Archive, Edit, ArrowUp, ArrowDown } from "lucide-react"

const StoreTable = ({
  data,
  selectedDay,
  setSelectedDay,
  selectedItem,
  handleRowClick,
  handleEditLocation,
  handleArchiveStore,
  showArchived,
  showReorderButtons,
  toggleReorderButtons,
  routeOrder,
  moveRouteUp,
  moveRouteDown,
  isLoading,
  tableRef,
}) => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  return (
    <div className="table-section">
      <div className="table-controls">
        <div className="day-filter">
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="day-select"
            aria-label="Filter by day"
          >
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
        {!showArchived && (
          <button
            onClick={toggleReorderButtons}
            className="reorder-toggle-btn"
            aria-label={showReorderButtons ? "Hide route arrangement" : "Arrange route"}
          >
            {showReorderButtons ? "Hide Arrange" : "Arrange Route"}
          </button>
        )}
      </div>

      <div className="table-wrapper" ref={tableRef}>
        <table className="store-table" aria-label="Stores">
          <thead>
            <tr>
              <th className="id-column">#</th>
              <th className="name-column">Store Name</th>
              <th className="location-column">Location</th>
              <th className="status-column">Status</th>
              {showReorderButtons && !showArchived && <th className="route-column">Route Arrange</th>}
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              routeOrder.map((orderIndex, index) => {
                const item = data[orderIndex]
                if (!item) return null

                return (
                  <tr
                    key={item.id}
                    onClick={() => handleRowClick(item)}
                    className={`${selectedItem?.id === item.id ? "selected-row" : ""} ${
                      item.is_archived ? "archived-row" : ""
                    }`}
                  >
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.location}</td>
                    <td>
                      {item.is_archived ? (
                        <span className="archived-badge">Archived</span>
                      ) : (
                        <span className="active-badge">Active</span>
                      )}
                    </td>
                    {showReorderButtons && !showArchived && !item.is_archived && (
                      <td className="reorder-buttons">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            moveRouteUp(index)
                          }}
                          disabled={index === 0}
                          className="up-btn"
                          aria-label="Move up"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            moveRouteDown(index)
                          }}
                          disabled={index === routeOrder.length - 1}
                          className="down-btn"
                          aria-label="Move down"
                        >
                          <ArrowDown size={16} />
                        </button>
                      </td>
                    )}
                    <td className="actions-cell">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditLocation(item)
                        }}
                        disabled={isLoading || item.is_archived}
                        className="edit-btn"
                        aria-label="Edit store"
                      >
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleArchiveStore(item.id)
                        }}
                        disabled={isLoading}
                        className="archive-btn"
                        aria-label={item.is_archived ? "Unarchive store" : "Archive store"}
                      >
                        <Archive size={16} />
                        <span>{item.is_archived ? "Unarchive" : "Archive"}</span>
                      </button>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={showReorderButtons && !showArchived ? 6 : 5} className="no-data">
                  No stores found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StoreTable

