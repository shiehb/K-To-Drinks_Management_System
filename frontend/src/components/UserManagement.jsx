"use client"

import { useState, useRef } from "react"
import { toast } from "react-toastify"
import { API_URL } from "../api/api_url"
import { Archive, Download, Edit, RefreshCcw, Search, UserPlus } from "lucide-react"

// Import shadcn components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
          const url = userForm.id ? `${API_URL}/users/${userForm.id}/` : `${API_URL}/users/`
          const method = userForm.id ? "PUT" : "POST"

          // Make the API call
          const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userForm),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Failed to save user")
          }

          const data = await response.json()
          if (userForm.id) {
            setUsers(users.map((user) => (user.id === userForm.id ? data : user)))
          } else {
            setUsers([...users, data])
          }

          toast.success(`User ${userForm.id ? "updated" : "added"} successfully!`)
          setIsUserModalOpen(false)
          resetUserForm()
        } catch (error) {
          toast.error(`Failed to save user: ${error.message || "Unknown error"}`)
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

      const response = await fetch(`${API_URL}/users/${id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userToArchive, status: "archived" }),
      })

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)

      const data = await response.json()
      setUsers(users.map((user) => (user.id === id ? data : user)))
      toast.success("User archived successfully!")
    } catch (error) {
      toast.error(`Failed to archive user: ${error.message || "Unknown error"}`)
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

      const response = await fetch(`${API_URL}/users/${id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userToUnarchive, status: "active" }),
      })

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)

      const data = await response.json()
      setUsers(users.map((user) => (user.id === id ? data : user)))
      toast.success("User unarchived successfully!")
    } catch (error) {
      toast.error(`Failed to unarchive user: ${error.message || "Unknown error"}`)
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

      const csvContent =
        "data:text/csv;charset=utf-8," +
        ["ID,Username,Name,Email,Role,Status"]
          .concat(
            filteredUsers.map(
              (user) =>
                `${user.id},${user.username},${capitalizeEachWord(user.name)},${user.email},${user.role},${user.status}`,
            ),
          )
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

        {/* User Form Modal */}
        <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen} className="user-dialog">
          <DialogContent className="dialog-content">
            <DialogHeader>
              <DialogTitle className="dialog-title">{userForm.id ? "Edit User" : "Add New User"}</DialogTitle>
              <DialogDescription className="dialog-description">
                {userForm.id ? "Update user information in the system." : "Add a new user to the system."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUserFormSubmit} className="user-form">
              <div className="form-field">
                <Label htmlFor="username" className="form-label">
                  Username
                </Label>
                <Input
                  id="username"
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  placeholder="Enter username"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-field">
                <Label htmlFor="name" className="form-label">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: capitalizeEachWord(e.target.value) })}
                  placeholder="Enter full name"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-field">
                <Label htmlFor="email" className="form-label">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-field">
                <Label htmlFor="role" className="form-label">
                  Role
                </Label>
                <Select
                  value={userForm.role}
                  onValueChange={(value) => setUserForm({ ...userForm, role: value })}
                  className="form-select"
                >
                  <SelectTrigger id="role" className="select-trigger">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="select-content">
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
              <div className="form-actions">
                <Button type="button" variant="outline" onClick={handleCancel} className="cancel-button">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="submit-button">
                  {isLoading ? (
                    <>
                      <RefreshCcw className="loading-icon" />
                      Saving...
                    </>
                  ) : userForm.id ? (
                    "Save Changes"
                  ) : (
                    "Add User"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <AlertDialog
          open={confirmationDialog.isOpen}
          onOpenChange={(open) => setConfirmationDialog((prev) => ({ ...prev, isOpen: open }))}
          className="confirmation-dialog"
        >
          <AlertDialogContent className="confirmation-content">
            <AlertDialogHeader>
              <AlertDialogTitle className="confirmation-title">{confirmationDialog.title}</AlertDialogTitle>
              <AlertDialogDescription className="confirmation-description">
                {confirmationDialog.message}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="confirmation-footer">
              <AlertDialogCancel className="confirmation-cancel">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  confirmationDialog.onConfirm()
                  setConfirmationDialog((prev) => ({ ...prev, isOpen: false }))
                }}
                className="confirmation-confirm"
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}

