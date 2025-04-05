"use client"

import { useState, useEffect } from "react"
import { ArrowUpRight, Calendar, Package, TrendingUp, Truck, Users, ChevronRight, ChevronLeft } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import "../css/dashboard.css"

// Import shadcn components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export default function Dashboard() {
  const { darkMode } = useAuth()
  const [selectedItem, setSelectedItem] = useState(null)
  const [deliveryData, setDeliveryData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const ordersPerPage = 5

  // Mock sales data (replace this with actual API calls or dynamic data)
  const mockSalesData = [
    {
      id: 1,
      title: "Today's Delivery",
      currentSales: 35,
      previousSales: 30,
      text: "Delivery",
      icon: <Truck className="h-5 w-5" />,
    },
    {
      id: 2,
      title: "Monthly Delivery",
      currentSales: 712,
      previousSales: 430,
      text: "Delivery",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      id: 3,
      title: "Delivery Issues",
      currentSales: 1,
      previousSales: 4,
      text: "Report",
      icon: <Package className="h-5 w-5" />,
    },
    {
      id: 4,
      title: "Total Delivery",
      currentSales: 2532,
      previousSales: 1812,
      text: "Delivery",
      icon: <TrendingUp className="h-5 w-5" />,
    },
  ]

  // Mock recent orders - expanded with more data for pagination
  const allOrders = [
    {
      id: "ORD-001",
      customer: "John Smith",
      store: "Downtown Market",
      items: 3,
      total: "₱6856.00",
      status: "delivered",
      date: "2025-04-05",
    },
    {
      id: "ORD-002",
      customer: "Sarah Johnson",
      store: "Westside Shop",
      items: 5,
      total: "₱2637.50",
      status: "in-transit",
      date: "2025-04-05",
    },
    {
      id: "ORD-003",
      customer: "Michael Brown",
      store: "Central Store",
      items: 2,
      total: "₱5489.99",
      status: "pending",
      date: "2025-04-05",
    },
    {
      id: "ORD-004",
      customer: "Emily Davis",
      store: "Northside Market",
      items: 7,
      total: "₱3465.00",
      status: "delivered",
      date: "2025-04-04",
    },
    {
      id: "ORD-005",
      customer: "David Wilson",
      store: "Eastside Shop",
      items: 1,
      total: "₱4565.99",
      status: "in-transit",
      date: "2025-04-04",
    },
    {
      id: "ORD-006",
      customer: "Lisa Anderson",
      store: "Southside Market",
      items: 4,
      total: "₱3299.50",
      status: "delivered",
      date: "2025-04-04",
    },
    {
      id: "ORD-007",
      customer: "Robert Taylor",
      store: "Harbor Shop",
      items: 2,
      total: "₱1875.25",
      status: "pending",
      date: "2025-04-03",
    },
    {
      id: "ORD-008",
      customer: "Jennifer Martinez",
      store: "Uptown Market",
      items: 6,
      total: "₱5125.75",
      status: "delivered",
      date: "2025-04-03",
    },
    {
      id: "ORD-009",
      customer: "William Johnson",
      store: "Riverside Store",
      items: 3,
      total: "₱2950.00",
      status: "in-transit",
      date: "2025-04-03",
    },
    {
      id: "ORD-010",
      customer: "Patricia Garcia",
      store: "Lakeside Market",
      items: 5,
      total: "₱4275.50",
      status: "delivered",
      date: "2025-04-02",
    },
  ]

  const [recentOrders, setRecentOrders] = useState([])

  // Calculate delivery metrics
  useEffect(() => {
    // Simulate loading
    setIsLoading(true)

    // Update data with calculated values after a short delay
    const timer = setTimeout(() => {
      setDeliveryData(
        mockSalesData.map((item) => ({
          ...item,
          description: `This is the ${item.title.toLowerCase()}.`,
          value: item.currentSales.toLocaleString(),
          percentChange: (((item.currentSales - item.previousSales) / item.previousSales) * 100).toFixed(1),
        })),
      )

      // Calculate total pages
      setTotalPages(Math.ceil(allOrders.length / ordersPerPage))

      // Set current page data
      const startIndex = (currentPage - 1) * ordersPerPage
      setRecentOrders(allOrders.slice(startIndex, startIndex + ordersPerPage))

      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [currentPage])

  const handleViewDetails = (item) => {
    setSelectedItem(item)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <div className={`dashboard-container ${darkMode ? "dark" : "light"}`}>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="tabs-list">
          <TabsTrigger value="overview" className="tab">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="tab">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="tab">
            Reports
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4 tab-content">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? // Skeleton loaders for cards
                Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <Card key={`skeleton-${index}`} className="card">
                      <CardHeader className="card-header flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                      </CardHeader>
                      <CardContent className="card-content">
                        <Skeleton className="h-8 w-16 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </CardContent>
                    </Card>
                  ))
              : deliveryData.map((item) => (
                  <Card key={item.id} className="card">
                    <CardHeader className="card-header flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                      <div className="h-4 w-4 text-muted-foreground">{item.icon}</div>
                    </CardHeader>
                    <CardContent className="card-content">
                      <div className="text-2xl font-bold">{item.value}</div>
                      <p className="text-xs text-muted-foreground">
                        {item.percentChange > 0 ? (
                          <span className="text-green-600">+{item.percentChange}%</span>
                        ) : (
                          <span className="text-red-600">{item.percentChange}%</span>
                        )}{" "}
                        from last period
                      </p>
                    </CardContent>
                  </Card>
                ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 card">
              <CardHeader className="card-header">
                <CardTitle className="card-title">Recent Orders</CardTitle>
                <CardDescription className="card-description">
                  {isLoading ? (
                    <Skeleton className="h-4 w-48" />
                  ) : (
                    `Showing ${(currentPage - 1) * ordersPerPage + 1}-${Math.min(currentPage * ordersPerPage, allOrders.length)} of ${allOrders.length} orders`
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="card-content p-0">
                <div className="table-container">
                  <Table className="table">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Store</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading
                        ? // Skeleton loaders for table rows
                          Array(5)
                            .fill(0)
                            .map((_, index) => (
                              <TableRow key={`skeleton-row-${index}`}>
                                <TableCell>
                                  <Skeleton className="h-4 w-16" />
                                </TableCell>
                                <TableCell>
                                  <Skeleton className="h-4 w-24" />
                                </TableCell>
                                <TableCell>
                                  <Skeleton className="h-4 w-32" />
                                </TableCell>
                                <TableCell className="text-right">
                                  <Skeleton className="h-4 w-16 ml-auto" />
                                </TableCell>
                                <TableCell className="text-right">
                                  <Skeleton className="h-6 w-20 ml-auto rounded-full" />
                                </TableCell>
                              </TableRow>
                            ))
                        : recentOrders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">{order.id}</TableCell>
                              <TableCell>{order.customer}</TableCell>
                              <TableCell>{order.store}</TableCell>
                              <TableCell className="text-right">{order.total}</TableCell>
                              <TableCell className="text-right">
                                <Badge
                                  className={`badge ${
                                    order.status === "delivered"
                                      ? "badge-success"
                                      : order.status === "in-transit"
                                        ? "badge-default"
                                        : "badge-secondary"
                                  }`}
                                >
                                  {order.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="card-footer">
                <div className="flex justify-between w-full">
                  <Button
                    variant="outline"
                    className="button button-outline button-sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    className="button button-primary button-sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
            <Card className="col-span-3 card">
              <CardHeader className="card-header">
                <CardTitle className="card-title">Delivery Performance</CardTitle>
                <CardDescription className="card-description">
                  Delivery efficiency metrics for the current month.
                </CardDescription>
              </CardHeader>
              <CardContent className="card-content">
                {isLoading ? (
                  <div className="metrics-container">
                    <div className="metric-item">
                      <div className="metric-indicator">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-5 w-10" />
                    </div>
                    <div className="metric-item">
                      <div className="metric-indicator">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-5 w-10" />
                    </div>
                    <div className="metric-item">
                      <div className="metric-indicator">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-5 w-10" />
                    </div>
                  </div>
                ) : (
                  <div className="metrics-container">
                    <div className="metric-item">
                      <div className="metric-indicator">
                        <div className="metric-dot bg-primary"></div>
                        <span className="metric-label">On-time Delivery</span>
                      </div>
                      <div className="metric-value">94%</div>
                    </div>
                    <div className="metric-item">
                      <div className="metric-indicator">
                        <div className="metric-dot bg-orange-500"></div>
                        <span className="metric-label">Delayed Delivery</span>
                      </div>
                      <div className="metric-value">5%</div>
                    </div>
                    <div className="metric-item">
                      <div className="metric-indicator">
                        <div className="metric-dot bg-red-500"></div>
                        <span className="metric-label">Failed Delivery</span>
                      </div>
                      <div className="metric-value">1%</div>
                    </div>

                    <div className="driver-container">
                      <h4 className="driver-title">Top Performing Drivers</h4>
                      <div className="driver-list">
                        <div className="driver-item">
                          <div className="driver-avatar">
                            <Users className="h-4 w-4" />
                          </div>
                          <div className="driver-info">
                            <p className="driver-name">Jericho Urbano</p>
                            <p className="driver-stat">98% on-time rate</p>
                          </div>
                          <Button variant="ghost" size="icon" className="button button-ghost button-icon ml-auto">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="driver-item">
                          <div className="driver-avatar">
                            <Users className="h-4 w-4" />
                          </div>
                          <div className="driver-info">
                            <p className="driver-name">Harry Justine Zabate</p>
                            <p className="driver-stat">97% on-time rate</p>
                          </div>
                          <Button variant="ghost" size="icon" className="button button-ghost button-icon ml-auto">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="card-footer">
                <Button variant="outline" className="button button-outline w-full button-sm">
                  View Detailed Report
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4 tab-content">
          <Card className="card">
            <CardHeader className="card-header">
              <CardTitle className="card-title">Analytics</CardTitle>
              <CardDescription className="card-description">
                View detailed analytics about your delivery operations.
              </CardDescription>
            </CardHeader>
            <CardContent className="card-content">
              <div className="placeholder">Analytics content will appear here</div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4 tab-content">
          <Card className="card">
            <CardHeader className="card-header">
              <CardTitle className="card-title">Reports</CardTitle>
              <CardDescription className="card-description">
                Access and download reports for your business.
              </CardDescription>
            </CardHeader>
            <CardContent className="card-content">
              <div className="placeholder">Reports content will appear here</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

