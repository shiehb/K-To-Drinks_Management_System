import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import { toast } from "react-toastify"
import DeliveryDashboard from "../components/delivery/DeliveryDashboard"
import { deliveryService, employeeService } from "../services/api"

// Mock the services
jest.mock("../services/api", () => ({
  deliveryService: {
    getAll: jest.fn(),
    updateStatus: jest.fn(),
    uploadSignature: jest.fn(),
  },
  employeeService: {
    getDeliveryEmployees: jest.fn(),
  },
}))

// Mock react-toastify
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}))

describe("DeliveryDashboard Component", () => {
  const mockDeliveries = [
    {
      id: "DEL-001",
      order_id: "ORD-001",
      customer_name: "John Smith",
      store_name: "Downtown Market",
      address: "123 Main St, Cityville",
      items_count: 3,
      total_amount: 6856.0,
      status: "delivered",
      employee_name: "Jericho Urbano",
      employee_id: 1,
      delivery_date: "2025-03-28",
      delivery_time: "14:30",
      notes: "Leave at front door",
      lat: 16.636,
      lng: 120.313,
    },
    {
      id: "DEL-002",
      order_id: "ORD-002",
      customer_name: "Sarah Johnson",
      store_name: "Westside Shop",
      address: "456 Oak Ave, Townsville",
      items_count: 5,
      total_amount: 2637.5,
      status: "in-transit",
      employee_name: "Harry Zabate",
      employee_id: 2,
      delivery_date: "2025-04-01",
      delivery_time: "10:15",
      notes: "Call upon arrival",
      lat: 16.64,
      lng: 120.32,
    },
  ]

  const mockEmployees = [
    { id: 1, name: "Jericho Urbano" },
    { id: 2, name: "Harry Zabate" },
  ]

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Setup default mock responses
    deliveryService.getAll.mockResolvedValue({ success: true, data: mockDeliveries })
    employeeService.getDeliveryEmployees.mockResolvedValue({ success: true, data: mockEmployees })
  })

  test("renders delivery dashboard with stats and table", async () => {
    render(
      <BrowserRouter>
        <DeliveryDashboard />
      </BrowserRouter>,
    )

    // Check if loading state is shown
    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    // Wait for data to load
    await waitFor(() => {
      expect(deliveryService.getAll).toHaveBeenCalled()
      expect(employeeService.getDeliveryEmployees).toHaveBeenCalled()
    })

    // Check if stats are displayed
    await waitFor(() => {
      expect(screen.getByText("Total Deliveries")).toBeInTheDocument()
      expect(screen.getByText("Completed")).toBeInTheDocument()
      expect(screen.getByText("Pending")).toBeInTheDocument()
      expect(screen.getByText("Today's Deliveries")).toBeInTheDocument()
    })

    // Check if table headers are displayed
    await waitFor(() => {
      expect(screen.getByText("ID")).toBeInTheDocument()
      expect(screen.getByText("Order")).toBeInTheDocument()
      expect(screen.getByText("Store")).toBeInTheDocument()
      expect(screen.getByText("Status")).toBeInTheDocument()
    })

    // Check if delivery data is displayed
    await waitFor(() => {
      expect(screen.getByText("DEL-001")).toBeInTheDocument()
      expect(screen.getByText("Downtown Market")).toBeInTheDocument()
      expect(screen.getByText("Jericho Urbano")).toBeInTheDocument()
    })
  })

  test("filters deliveries based on search query", async () => {
    render(
      <BrowserRouter>
        <DeliveryDashboard />
      </BrowserRouter>,
    )

    // Wait for data to load
    await waitFor(() => {
      expect(deliveryService.getAll).toHaveBeenCalled()
    })

    // Enter search query
    const searchInput = screen.getByPlaceholderText("Search deliveries...")
    fireEvent.change(searchInput, { target: { value: "Downtown" } })

    // Check if filtered results are displayed
    await waitFor(() => {
      expect(screen.getByText("DEL-001")).toBeInTheDocument()
      expect(screen.queryByText("DEL-002")).not.toBeInTheDocument()
    })
  })

  test("handles status update correctly", async () => {
    // Mock successful status update
    deliveryService.updateStatus.mockResolvedValue({ success: true })

    render(
      <BrowserRouter>
        <DeliveryDashboard />
      </BrowserRouter>,
    )

    // Wait for data to load
    await waitFor(() => {
      expect(deliveryService.getAll).toHaveBeenCalled()
    })

    // Find and click the status update button for in-transit delivery
    const completeButton = await screen.findByText("Complete")
    fireEvent.click(completeButton)

    // Check if status modal is displayed
    await waitFor(() => {
      expect(screen.getByText("Update Delivery Status")).toBeInTheDocument()
    })

    // Click update button
    const updateButton = screen.getByText("Update Status")
    fireEvent.click(updateButton)

    // Check if status update API was called
    await waitFor(() => {
      expect(deliveryService.updateStatus).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalled()
    })
  })
})

