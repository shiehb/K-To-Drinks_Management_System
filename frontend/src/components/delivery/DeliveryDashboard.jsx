"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { toast } from "react-toastify"
import { FaTruck, FaCheckCircle, FaHourglassHalf, FaCalendarDay, FaSearch, FaMapMarkedAlt } from "react-icons/fa"
import StatusUpdateModal from "./StatusUpdateModal"
import MapView from "./MapView"
import SignaturePad from "./SignaturePad"
import { employeeService } from "../../services/api"
import useDebounce from "../../hooks/useDebounce"
import { useMediaQuery } from "../../hooks/useMediaQuery"
import "../../css/pages.css"

const DeliveryDashboard = ({
  deliveries = [],
  loading = false,
  error = null,
  onStatusUpdate,
  onSignatureUpload,
  onRefresh,
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")
  const [employeeFilter, setEmployeeFilter] = useState("")
  const [employees, setEmployees] = useState([])
  const [filteredDeliveries, setFilteredDeliveries] = useState([])
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [showMapView, setShowMapView] = useState(false)
  const [showRoutePlanning, setShowRoutePlanning] = useState(false)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))

  // Custom hooks
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Stats calculation
  const stats = {
    total: deliveries.length,
    completed: deliveries.filter((d) => d.status === "delivered").length,
    pending: deliveries.filter((d) => d.status === "pending").length,
    inTransit: deliveries.filter((d) => d.status === "in-transit").length,
    today: deliveries.filter((d) => d.delivery_date === format(new Date(), "yyyy-MM-dd")).length,
  }

  // Fetch employees on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const result = await employeeService.getDeliveryEmployees()
        if (result.success) {
          setEmployees(result.data)
        } else {
          toast.error("Failed to fetch delivery staff")
        }
      } catch (error) {
        console.error("Error fetching employees:", error)
      }
    }

    fetchEmployees()
  }, [])

  // Filter deliveries based on search query and filters
  useEffect(() => {
    let filtered = [...deliveries]

    // Apply search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase()
      filtered = filtered.filter(
        (delivery) =>
          delivery.id.toLowerCase().includes(query) ||
          delivery.order_id.toLowerCase().includes(query) ||
          delivery.customer_name.toLowerCase().includes(query) ||
          delivery.store_name.toLowerCase().includes(query) ||
          delivery.address.toLowerCase().includes(query) ||
          (delivery.employee_name && delivery.employee_name.toLowerCase().includes(query)),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((delivery) => delivery.status === statusFilter)
    }

    // Apply date filter
    if (dateFilter) {
      filtered = filtered.filter((delivery) => delivery.delivery_date === dateFilter)
    }

    // Apply employee filter
    if (employeeFilter) {
      filtered = filtered.filter((delivery) => delivery.employee_id === Number.parseInt(employeeFilter))
    }

    setFilteredDeliveries(filtered)
  }, [deliveries, debouncedSearchQuery, statusFilter, dateFilter, employeeFilter])

  // Handle status update
  const handleStatusUpdate = async (status, notes) => {
    if (!selectedDelivery) return

    const success = await onStatusUpdate(selectedDelivery.id, {
      status,
      notes,
      update_time: new Date().toISOString(),
    })

    if (success) {
      setShowStatusModal(false)

      // If status is delivered, show signature pad
      if (status === "delivered") {
        setShowSignatureModal(true)
      }
    }
  }

  // Handle signature submission
  const handleSignatureSubmit = async (signatureData) => {
    if (!selectedDelivery) return

    const success = await onSignatureUpload(selectedDelivery.id, signatureData)

    if (success) {
      setShowSignatureModal(false)
    }
  }

  // Handle route planning
  const handleRoutePlanning = () => {
    setShowRoutePlanning(true)
  }

  return (
    <div className="delivery-dashboard p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Delivery Management</h1>
        <div className="flex flex-col md:flex-row gap-2">
          <button onClick={onRefresh} className="btn btn-primary" disabled={loading}>
            Refresh
          </button>
          <button onClick={() => setShowMapView(!showMapView)} className="btn btn-secondary flex items-center gap-2">
            <FaMapMarkedAlt /> {showMapView ? "Hide Map" : "Show Map"}
          </button>
          <button onClick={handleRoutePlanning} className="btn btn-info flex items-center gap-2">
            <FaTruck /> Plan Routes
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="stat-card bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500">Total Deliveries</h3>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FaTruck className="text-3xl text-blue-500" />
          </div>
        </div>

        <div className="stat-card bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500">Completed</h3>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <FaCheckCircle className="text-3xl text-green-500" />
          </div>
        </div>

        <div className="stat-card bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500">Pending</h3>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <FaHourglassHalf className="text-3xl text-yellow-500" />
          </div>
        </div>

        <div className="stat-card bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500">Today's Deliveries</h3>
              <p className="text-2xl font-bold">{stats.today}</p>
            </div>
            <FaCalendarDay className="text-3xl text-purple-500" />
          </div>
        </div>
      </div>

      {/* Map View */}
      {showMapView && (
        <div className="mb-6">
          <MapView
            deliveries={filteredDeliveries}
            selectedDelivery={selectedDelivery}
            onSelectDelivery={setSelectedDelivery}
          />
        </div>
      )}

      {/* Route Planning View */}
      {showRoutePlanning && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Route Planning</h2>
            <button onClick={() => setShowRoutePlanning(false)} className="btn btn-sm btn-outline">
              Close
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Select Driver</label>
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">All Drivers</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <MapView
            deliveries={filteredDeliveries.filter((d) => d.delivery_date === selectedDate)}
            showRoutes={true}
            selectedEmployee={employeeFilter ? Number.parseInt(employeeFilter) : null}
          />
        </div>
      )}

      {/* Filters */}
      <div className="filters bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search deliveries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 p-2 border rounded"
              />
            </div>
          </div>

          <div className="flex flex-1 gap-2">
            <div className="flex-1">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex-1">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Filter by date"
              />
            </div>

            <div className="flex-1">
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">All Drivers</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="spinner"></div>
            <p className="mt-2">Loading deliveries...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <p>{error}</p>
            <button onClick={onRefresh} className="mt-4 btn btn-primary">
              Try Again
            </button>
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No deliveries found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">{delivery.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{delivery.order_id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{delivery.store_name}</div>
                      <div className="text-sm text-gray-500">{delivery.address}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>{delivery.delivery_date}</div>
                      <div className="text-sm text-gray-500">{delivery.delivery_time}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{delivery.employee_name || "Not Assigned"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium
                        ${delivery.status === "delivered" ? "bg-green-100 text-green-800" : ""}
                        ${delivery.status === "in-transit" ? "bg-blue-100 text-blue-800" : ""}
                        ${delivery.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
                        ${delivery.status === "cancelled" ? "bg-red-100 text-red-800" : ""}
                      `}
                      >
                        {delivery.status.replace("-", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedDelivery(delivery)
                            setShowStatusModal(true)
                          }}
                          className="btn btn-sm btn-primary"
                          disabled={delivery.status === "delivered" || delivery.status === "cancelled"}
                        >
                          {delivery.status === "pending" ? "Start" : "Complete"}
                        </button>

                        <button
                          onClick={() => {
                            setSelectedDelivery(delivery)
                            setShowMapView(true)
                          }}
                          className="btn btn-sm btn-secondary"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedDelivery && (
        <StatusUpdateModal
          delivery={selectedDelivery}
          onClose={() => setShowStatusModal(false)}
          onUpdate={handleStatusUpdate}
        />
      )}

      {/* Signature Modal */}
      {showSignatureModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Capture Signature</h2>
            <p className="mb-4">Please have the customer sign below to confirm delivery.</p>

            <SignaturePad
              width={350}
              height={200}
              onChange={handleSignatureSubmit}
              onClose={() => setShowSignatureModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default DeliveryDashboard

