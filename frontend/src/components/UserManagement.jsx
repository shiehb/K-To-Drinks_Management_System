"use client"

import { useState, useRef } from "react"
import { toast } from "react-toastify"
import api from "../api/api_url"
import { Archive, Download, Edit, RefreshCcw, UserPlus, Pause, Play, Search } from "lucide-react"

// Import shadcn components
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

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
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    role: "employee",
    status: "active",
    is_staff: false,
    is_active: true,
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

    if (!userForm.username?.trim() || !userForm.first_name?.trim() || !userForm.last_name?.trim()) {
      toast.error("Username, First Name and Last Name are required.")
      setIsLoading(false)
      return
    }

    showConfirmationDialog(
      `${userForm.id ? "Update" : "Add"} User`,
      `Are you sure you want to ${userForm.id ? "save changes to" : "add"} this user?`,
      async () => {
        try {
          const isDuplicateUsername = users.some(
            (user) => user.username?.toLowerCase() === userForm.username?.toLowerCase() && user.id !== userForm.id,
          )

          if (isDuplicateUsername) throw new Error("Username is already taken.")

          const url = userForm.id ? `/users/${userForm.id}/` : `/users/`
          const method = userForm.id ? "put" : "post"

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
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      role: "employee",
      status: "active",
      is_staff: false,
      is_active: true,
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

  // Deactivate User
  const handleDeactivateUser = (id) => {
    showConfirmationDialog("Deactivate User", "Are you sure you want to deactivate this user?", () =>
      confirmDeactivation(id),
    )
  }

  const confirmDeactivation = async (id) => {
    try {
      const userToDeactivate = users.find((user) => user.id === id)
      if (!userToDeactivate) throw new Error("User not found")

      const updatedUser = { ...userToDeactivate, status: "inactive" }
      const response = await api.put(`/users/${id}/`, updatedUser)

      const data = response.data
      setUsers(users.map((user) => (user.id === id ? data : user)))
      toast.success("User deactivated successfully!")
    } catch (error) {
      console.error("Deactivation error:", error)
      toast.error(error.response?.data?.message || "Failed to deactivate user")
    }
  }

  // Activate User
  const handleActivateUser = (id) => {
    showConfirmationDialog("Activate User", "Are you sure you want to activate this user?", () => confirmActivation(id))
  }

  const confirmActivation = async (id) => {
    try {
      const userToActivate = users.find((user) => user.id === id)
      if (!userToActivate) throw new Error("User not found")

      const updatedUser = { ...userToActivate, status: "active" }
      const response = await api.put(`/users/${id}/`, updatedUser)

      const data = response.data
      setUsers(users.map((user) => (user.id === id ? data : user)))
      toast.success("User activated successfully!")
    } catch (error) {
      console.error("Activation error:", error)
      toast.error(error.response?.data?.message || "Failed to activate user")
    }
  }

  // Filter Users - Updated to show inactive users in active tab
  const filteredUsers = users.filter(
    (user) =>
      (activeTab === "archived" ? user.status === "archived" : user.status !== "archived") &&
      (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
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

      const headers = ["ID", "Username", "First Name", "Last Name", "Email", "Phone", "Role", "Status"]
      const csvContent =
        "data:text/csv;charset=utf-8," +
        headers.join(",") +
        "\n" +
        filteredUsers
          .map((user) => {
            const escapedFirstName = `"${capitalizeEachWord(user.first_name)}"`
            const escapedLastName = `"${capitalizeEachWord(user.last_name)}"`
            const escapedEmail = `"${user.email || ""}"`
            return [
              user.id,
              user.username,
              escapedFirstName,
              escapedLastName,
              escapedEmail,
              user.phone_number || "",
              user.role,
              user.status,
            ].join(",")
          })
          .join("\n")

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `users_export_${date}_${time}.csv`)
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
    if (!str) return ""
    return str.toString().replace(/\b\w/g, (char) => char.toUpperCase())
  }

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

  const getStatusDisplayName = (status) => {
    switch (status) {
      case "active":
        return "Active"
      case "inactive":
        return "Inactive"
      case "archived":
        return "Archived"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
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
      setUserForm({
        ...user,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone_number: user.phone_number || "",
      })
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
        {/* Replace the old filter container with the new FilterBar component */}
        <div className="filter-bar">
          <div className="tabs-container">
            <button
              className={`tab-button ${activeTab === "active" ? "active" : ""}`}
              onClick={() => setActiveTab("active")}
            >
              Manage Users
            </button>
            <button
              className={`tab-button ${activeTab === "archived" ? "active" : ""}`}
              onClick={() => setActiveTab("archived")}
            >
              Archived Users
            </button>
          </div>

          <div className="filters-container">
            <div className="search-container">
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

            <div className="role-select-container">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="role-select-trigger">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent className="role-select-content">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="delivery_driver">Delivery Driver</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="status-badge">
            <div className="status-indicator">
              <span className="status-dot"></span>
              Showing <strong>{filteredUsers.length}</strong> of{" "}
              <strong>
                {
                  users.filter((user) =>
                    activeTab === "archived" ? user.status === "archived" : user.status !== "archived",
                  ).length
                }
              </strong>{" "}
              {activeTab === "archived" ? "archived" : "active/inactive"} users
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="tabs-container hidden">
          <TabsContent value="active" className="tab-content">
            <div className="table-container">
              <Table className="user-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="id-column text-center">ID</TableHead>
                    <TableHead className="text-center">Username</TableHead>
                    <TableHead className="text-center">First Name</TableHead>
                    <TableHead className="text-center">Last Name</TableHead>
                    <TableHead className="email-column text-center">Email</TableHead>
                    <TableHead className="text-center">Phone</TableHead>
                    <TableHead className="text-center">Role</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="actions-column text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="loading-cell text-center">
                        <div className="loading-indicator flex justify-center items-center">
                          <RefreshCcw className="loading-icon" />
                          Loading users...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="empty-cell text-center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="id-cell text-center">{user.id}</TableCell>
                        <TableCell className="text-center">{user.username || "-"}</TableCell>
                        <TableCell className="text-center">{capitalizeEachWord(user.first_name) || "-"}</TableCell>
                        <TableCell className="text-center">{capitalizeEachWord(user.last_name) || "-"}</TableCell>
                        <TableCell className="email-cell text-center">{user.email || "-"}</TableCell>
                        <TableCell className="text-center">{user.phone_number || "-"}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="role-badge mx-auto">
                            {getRoleDisplayName(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div
                            className={`status-indicator status-${user.status} ${user.status === "active" ? "pulse" : ""}`}
                          >
                            <span className="status-dot"></span>
                            {getStatusDisplayName(user.status)}
                          </div>
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
                            </Button>
                            {user.status === "active" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeactivateUser(user.id)}
                                className="action-button"
                              >
                                <Pause className="action-icon" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleActivateUser(user.id)}
                                className="action-button"
                              >
                                <Play className="action-icon" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleArchiveUser(user.id)}
                              className="action-button"
                            >
                              <Archive className="action-icon" />
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
                    <TableHead className="text-center">First Name</TableHead>
                    <TableHead className="text-center">Last Name</TableHead>
                    <TableHead className="email-column text-center">Email</TableHead>
                    <TableHead className="text-center">Phone</TableHead>
                    <TableHead className="text-center">Role</TableHead>
                    <TableHead className="actions-column text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="loading-cell text-center">
                        <div className="loading-indicator flex justify-center items-center">
                          <RefreshCcw className="loading-icon" />
                          Loading users...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="empty-cell text-center">
                        No archived users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="id-cell text-center">{user.id}</TableCell>
                        <TableCell className="text-center">{user.username || "-"}</TableCell>
                        <TableCell className="text-center">{capitalizeEachWord(user.first_name) || "-"}</TableCell>
                        <TableCell className="text-center">{capitalizeEachWord(user.last_name) || "-"}</TableCell>
                        <TableCell className="email-cell text-center">{user.email || "-"}</TableCell>
                        <TableCell className="text-center">{user.phone_number || "-"}</TableCell>
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
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="username" className="form-label required">
                      Username
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
                    <label htmlFor="first_name" className="form-label required">
                      First Name
                    </label>
                    <input
                      id="first_name"
                      type="text"
                      value={userForm.first_name}
                      onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })}
                      placeholder="Enter first name"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="last_name" className="form-label required">
                      Last Name
                    </label>
                    <input
                      id="last_name"
                      type="text"
                      value={userForm.last_name}
                      onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })}
                      placeholder="Enter last name"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      placeholder="Enter email address"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone_number" className="form-label">
                      Phone Number
                    </label>
                    <input
                      id="phone_number"
                      type="tel"
                      value={userForm.phone_number}
                      onChange={(e) => setUserForm({ ...userForm, phone_number: e.target.value })}
                      placeholder="Enter phone number"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="role" className="form-label">
                      Role
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

                  {userForm.id && (
                    <div className="form-group">
                      <label htmlFor="status" className="form-label">
                        Status
                      </label>
                      <select
                        id="status"
                        value={userForm.status}
                        onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                        className="form-select"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="button" onClick={handleCancel} className="cancel-button">
                    Cancel
                  </button>
                  <button type="submit" className={`save-button ${isLoading ? "loading" : ""}`} disabled={isLoading}>
                    {isLoading ? "" : userForm.id ? "Save Changes" : "Add User"}
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

