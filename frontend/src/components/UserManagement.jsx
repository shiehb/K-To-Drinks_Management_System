"use client"

import { useState, useRef } from "react"
import { toast } from "react-toastify"
import api from "../api/api_url"
import { Archive, Download, Edit, RefreshCcw, Search, UserPlus } from "lucide-react"

// Import shadcn components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import "../css/usermanagement.css"

export default function UserManagement({ users, loading, setUsers }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("active")
  const inputRef = useRef(null)
  const [userForm, setUserForm] = useState({
    id: null,
    username: "",
    name: "",
    email: "",
    role: "employee",
    status: "active",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  })

  // Handle User Form Submission
  const handleUserFormSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Check if required fields are filled
    if (!userForm.username || !userForm.name || !userForm.email) {
      toast.error("Username, Name, and Email are required.")
      setIsLoading(false)
      return
    }

    showConfirmationDialog(
      `${userForm.id ? "Update" : "Add"} User`,
      `Are you sure you want to ${userForm.id ? "save changes to" : "add"} this user?`,
      async () => {
        try {
          // Check for duplicates
          const isDuplicateUsername = users.some(
            (user) => user.username.toLowerCase() === userForm.username.toLowerCase() && user.id !== userForm.id,
          )
          const isDuplicateName = users.some(
            (user) => user.name.toLowerCase() === userForm.name.toLowerCase() && user.id !== userForm.id,
          )
          const isDuplicateEmail = users.some(
            (user) => user.email.toLowerCase() === userForm.email.toLowerCase() && user.id !== userForm.id,
          )

          if (isDuplicateUsername) throw new Error("Username is already taken.")
          if (isDuplicateName) throw new Error("Name is already taken.")
          if (isDuplicateEmail) throw new Error("Email is already taken.")

          // Determine the API URL and method
          const url = userForm.id ? `/users/${userForm.id}/` : `/users/`
          const method = userForm.id ? "put" : "post"

          // Make the API call using axios instance
          const response = await api({
            url,
            method,
            data: userForm,
          })

          const data = response.data
          if (userForm.id) {
            setUsers(users.map((user) => (user.id === userForm.id ? data : user)))
          } else {
            setUsers([...users, data])
          }

          toast.success(`User ${userForm.id ? "updated" : "added"} successfully!`)
          setIsUserModalOpen(false)
          resetUserForm()
        } catch (error) {
          console.error("User save error:", error.response || error)
          const errorMsg =
            error.response?.data?.message || error.response?.data?.detail || error.message || "Failed to save user"
          toast.error(errorMsg)
        } finally {
          setIsLoading(false)
        }
      },
    )
  }

  // Reset user form to default values
  const resetUserForm = () => {
    setUserForm({
      id: null,
      username: "",
      name: "",
      email: "",
      role: "employee",
      status: "active",
    })
  }

  // Show confirmation dialog
  const showConfirmationDialog = (title, message, onConfirm) => {
    setConfirmationDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
    })
  }

  // Archive User
  const handleArchiveUser = (id) => {
    showConfirmationDialog("Archive User", "Are you sure you want to archive this user?", () => confirmArchive(id))
  }

  const confirmArchive = async (id) => {
    try {
      const userToArchive = users.find((user) => user.id === id)
      if (!userToArchive) throw new Error("User not found")

      // Create a copy of the user object with updated status
      const updatedUser = { ...userToArchive, status: "archived" }

      const response = await api.put(`/users/${id}/`, updatedUser)

      const data = response.data
      setUsers(users.map((user) => (user.id === id ? data : user)))
      toast.success("User archived successfully!")
    } catch (error) {
      console.error("Archive error:", error.response || error)
      const errorMsg =
        error.response?.data?.message || error.response?.data?.detail || error.message || "Failed to archive user"
      toast.error(errorMsg)
    }
  }

  // Unarchive User
  const handleUnarchiveUser = (id) => {
    showConfirmationDialog("Unarchive User", "Are you sure you want to unarchive this user?", () =>
      confirmUnarchive(id),
    )
  }

  const confirmUnarchive = async (id) => {
    try {
      const userToUnarchive = users.find((user) => user.id === id)
      if (!userToUnarchive) throw new Error("User not found")

      // Create a copy of the user object with updated status
      const updatedUser = { ...userToUnarchive, status: "active" }

      const response = await api.put(`/users/${id}/`, updatedUser)

      const data = response.data
      setUsers(users.map((user) => (user.id === id ? data : user)))
      toast.success("User unarchived successfully!")
    } catch (error) {
      console.error("Unarchive error:", error.response || error)
      const errorMsg =
        error.response?.data?.message || error.response?.data?.detail || error.message || "Failed to unarchive user"
      toast.error(errorMsg)
    }
  }

  // Filter Users
  const filteredUsers = users.filter(
    (user) =>
      (activeTab === "archived" ? user.status === "archived" : user.status === "active") &&
      (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (roleFilter === "all" || roleFilter === "" || user.role === roleFilter),
  )

  // Export Users to CSV
  const exportUsers = () => {
    try {
      if (filteredUsers.length === 0) {
        toast.error("No users to export based on the current filter.")
        return
      }

      showConfirmationDialog("Export User Data", "Are you sure you want to export user data?", confirmExport)
    } catch (error) {
      toast.error(`Failed to export user data: ${error.message || "Unknown error"}`)
    }
  }

  const confirmExport = () => {
    try {
      const now = new Date()
      const date = now.toISOString().split("T")[0]
      const time = now.toTimeString().split(" ")[0].replace(/:/g, "-")

      // Improved CSV formatting with proper headers and data
      const headers = ["ID", "Username", "Full Name", "Email", "Role", "Status"]

      // Create CSV content with proper escaping for special characters
      const csvContent =
        "data:text/csv;charset=utf-8," +
        headers.join(",") +
        "\n" +
        filteredUsers
          .map((user) => {
            // Escape fields that might contain commas
            const escapedName = `"${capitalizeEachWord(user.name)}"`
            const escapedEmail = `"${user.email}"`
            return [user.id, user.username, escapedName, escapedEmail, user.role, user.status].join(",")
          })
          .join("\n")

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `K-TO-DRINK_Trading_users_${date}_${time}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("User data exported successfully!")
    } catch (error) {
      toast.error(`Failed to export user data: ${error.message || "Unknown error"}`)
    }
  }

  // Utility Functions
  const capitalizeEachWord = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase())
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.select()
    }
  }

  const openUserModal = (user = null) => {
    if (user) {
      setUserForm({ ...user })
    } else {
      resetUserForm()
    }
    setIsUserModalOpen(true)
  }

  const handleCancel = () => {
    showConfirmationDialog("Cancel Changes", "Are you sure you want to cancel? Unsaved changes will be lost.", () =>
      setIsUserModalOpen(false),
    )
  }

  // Get role display name
  const getRoleDisplayName = (role) => {
    switch (role) {
      case "manager":
        return "Manager"
      case "delivery_driver":
        return "Delivery Driver"
      case "employee":
        return "Employee"
      default:
        return role.charAt(0).toUpperCase() + role.slice(1)
    }
  }

  return (
    <Card className="user-management-card">
      <CardHeader className="card-header">
        <div className="header-container">
          <CardTitle className="card-title">User Management</CardTitle>
          <div className="button-group">
            <Button onClick={() => openUserModal()} size="sm" className="add-button">
              <UserPlus className="icon" />
              Add User
            </Button>
            <Button onClick={exportUsers} variant="outline" size="sm" className="export-button">
              <Download className="icon" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="card-content">
        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="tabs-container">
          <div className="filter-container">
            <TabsList className="tabs-list">
              <TabsTrigger value="active" className="tab">
                Active Users
              </TabsTrigger>
              <TabsTrigger value="archived" className="tab">
                Archived Users
              </TabsTrigger>
            </TabsList>
            <div className="search-container">
              <div className="search-input-container">
                <Search className="search-icon" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={handleSearch}
                  onFocus={handleFocus}
                  ref={inputRef}
                  className="search-input"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter} className="role-select">
                <SelectTrigger className="select-trigger">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent className="select-content">
                  <SelectItem value="all" className="select-item">
                    All Roles
                  </SelectItem>
                  <SelectItem value="manager" className="select-item">
                    Manager
                  </SelectItem>
                  <SelectItem value="delivery_driver" className="select-item">
                    Delivery Driver
                  </SelectItem>
                  <SelectItem value="employee" className="select-item">
                    Employee
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="status-container">
            <div className="status-content">
              <div className="status-text">
                {loading ? (
                  <span>Loading users...</span>
                ) : (
                  <span>
                    Showing <strong>{filteredUsers.length}</strong> of{" "}
                    <strong>
                      {
                        users.filter((user) =>
                          activeTab === "archived" ? user.status === "archived" : user.status === "active",
                        ).length
                      }
                    </strong>{" "}
                    {activeTab} users
                  </span>
                )}
              </div>
            </div>
          </div>

          <TabsContent value="active" className="tab-content">
            <div className="table-container">
              <Table className="user-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="id-column text-center">ID</TableHead>
                    <TableHead className="text-center">Username</TableHead>
                    <TableHead className="text-center">Name</TableHead>
                    <TableHead className="email-column text-center">Email</TableHead>
                    <TableHead className="text-center">Role</TableHead>
                    <TableHead className="actions-column text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="loading-cell text-center">
                        <div className="loading-indicator flex justify-center items-center">
                          <RefreshCcw className="loading-icon" />
                          Loading users...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="empty-cell text-center">
                        No users found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="id-cell text-center">{user.id}</TableCell>
                        <TableCell className="text-center">{user.username}</TableCell>
                        <TableCell className="text-center">{capitalizeEachWord(user.name)}</TableCell>
                        <TableCell className="email-cell text-center">{user.email}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="role-badge mx-auto">
                            {getRoleDisplayName(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="actions-cell text-center">
                          <div className="actions-container flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openUserModal(user)}
                              className="action-button"
                            >
                              <Edit className="action-icon" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleArchiveUser(user.id)}
                              className="action-button"
                            >
                              <Archive className="action-icon" />
                              <span className="sr-only">Archive</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="archived" className="tab-content">
            <div className="table-container">
              <Table className="user-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="id-column text-center">ID</TableHead>
                    <TableHead className="text-center">Username</TableHead>
                    <TableHead className="text-center">Name</TableHead>
                    <TableHead className="email-column text-center">Email</TableHead>
                    <TableHead className="text-center">Role</TableHead>
                    <TableHead className="actions-column text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="loading-cell text-center">
                        <div className="loading-indicator flex justify-center items-center">
                          <RefreshCcw className="loading-icon" />
                          Loading users...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="empty-cell text-center">
                        No archived users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="id-cell text-center">{user.id}</TableCell>
                        <TableCell className="text-center">{user.username}</TableCell>
                        <TableCell className="text-center">{capitalizeEachWord(user.name)}</TableCell>
                        <TableCell className="email-cell text-center">{user.email}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="role-badge mx-auto">
                            {getRoleDisplayName(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="actions-cell text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnarchiveUser(user.id)}
                            className="restore-button mx-auto"
                          >
                            <RefreshCcw className="action-icon" />
                            Restore
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {isUserModalOpen && (
          <div className="custom-modal-overlay">
            <div className="custom-modal">
              <h2 className="modal-title">{userForm.id ? "Edit User" : "Add User"}</h2>

              <form onSubmit={handleUserFormSubmit} className="user-form">
                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    Username:
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    placeholder="Enter username"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name:
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: capitalizeEachWord(e.target.value) })}
                    placeholder="Enter full name"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email:
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role" className="form-label">
                    Role:
                  </label>
                  <select
                    id="role"
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="form-select"
                  >
                    <option value="manager">Manager</option>
                    <option value="delivery_driver">Delivery Driver</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-button" disabled={isLoading}>
                    {isLoading ? "Saving..." : userForm.id ? "Save" : "Add User"}
                  </button>

                  <button type="button" onClick={handleCancel} className="cancel-button">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {confirmationDialog.isOpen && (
          <div className="custom-modal-overlay">
            <div className="custom-modal confirmation-modal">
              <div className="confirmation-icon">
                <span className="material-icons">warning</span>
              </div>
              <h3 className="confirmation-title">{confirmationDialog.title}</h3>
              <p className="confirmation-message">{confirmationDialog.message}</p>
              <div className="confirmation-actions">
                <button
                  onClick={() => setConfirmationDialog((prev) => ({ ...prev, isOpen: false }))}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    confirmationDialog.onConfirm()
                    setConfirmationDialog((prev) => ({ ...prev, isOpen: false }))
                  }}
                  className="confirm-button"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

