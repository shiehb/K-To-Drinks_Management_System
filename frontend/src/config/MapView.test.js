import { render, screen } from "@testing-library/react"
import MapView from "../components/delivery/MapView"

// Mock Leaflet
jest.mock("leaflet", () => {
  const originalModule = jest.requireActual("leaflet")

  // Mock map instance
  const mockMap = {
    setView: jest.fn().mockReturnThis(),
    remove: jest.fn(),
    addControl: jest.fn(),
    removeControl: jest.fn(),
    removeLayer: jest.fn(),
    fitBounds: jest.fn(),
  }

  // Mock marker
  const mockMarker = {
    addTo: jest.fn().mockReturnThis(),
    bindPopup: jest.fn().mockReturnThis(),
  }

  // Mock routing control
  const mockRoutingControl = {
    addTo: jest.fn().mockReturnThis(),
  }

  return {
    ...originalModule,
    map: jest.fn().mockReturnValue(mockMap),
    tileLayer: jest.fn().mockReturnValue({
      addTo: jest.fn(),
    }),
    marker: jest.fn().mockReturnValue(mockMarker),
    latLng: jest.fn(),
    latLngBounds: jest.fn().mockReturnValue({
      extend: jest.fn(),
    }),
    divIcon: jest.fn(),
    control: jest.fn().mockReturnValue({
      onAdd: jest.fn(),
      addTo: jest.fn(),
    }),
    Routing: {
      control: jest.fn().mockReturnValue(mockRoutingControl),
    },
  }
})

// Mock toast
jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
  },
}))

describe("MapView Component", () => {
  const mockDeliveries = [
    {
      id: "DEL-001",
      store_name: "Downtown Market",
      status: "delivered",
      employee_name: "Jericho Urbano",
      delivery_date: "2025-03-28",
      delivery_time: "14:30",
      address: "123 Main St, Cityville",
      lat: 16.636,
      lng: 120.313,
    },
    {
      id: "DEL-002",
      store_name: "Westside Shop",
      status: "in-transit",
      employee_name: "Harry Zabate",
      delivery_date: "2025-04-01",
      delivery_time: "10:15",
      address: "456 Oak Ave, Townsville",
      lat: 16.64,
      lng: 120.32,
    },
  ]

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Mock navigator.geolocation
    global.navigator.geolocation = {
      getCurrentPosition: jest
        .fn()
        .mockImplementation((success) => success({ coords: { latitude: 16.638, longitude: 120.315 } })),
    }
  })

  test("renders map container", () => {
    render(<MapView deliveries={mockDeliveries} />)

    // Check if the map container is rendered
    const mapContainer = screen.getByRole("region")
    expect(mapContainer).toBeInTheDocument()
  })

  test("handles empty deliveries array", () => {
    render(<MapView deliveries={[]} />)

    // Check if the map container is rendered even with empty deliveries
    const mapContainer = screen.getByRole("region")
    expect(mapContainer).toBeInTheDocument()
  })

  test("handles deliveries with missing coordinates", () => {
    const deliveriesWithMissingCoords = [
      ...mockDeliveries,
      {
        id: "DEL-003",
        store_name: "Invalid Location",
        status: "pending",
        employee_name: null,
        delivery_date: "2025-04-02",
        delivery_time: "09:00",
        address: "Unknown",
        lat: null,
        lng: null,
      },
    ]

    render(<MapView deliveries={deliveriesWithMissingCoords} />)

    // Check if the map container is rendered
    const mapContainer = screen.getByRole("region")
    expect(mapContainer).toBeInTheDocument()
  })
})

