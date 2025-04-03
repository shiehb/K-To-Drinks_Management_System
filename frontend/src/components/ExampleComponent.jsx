"use client"

import { useState } from "react"
import { useApi, useApiMutation } from "../hooks/useApi"
import { API_URL } from "../config/environment"

export default function ExampleComponent() {
  const [userId, setUserId] = useState("")

  // Example of using the useApi hook for GET requests
  const { data: users, loading: usersLoading, error: usersError, refetch: refetchUsers } = useApi("/users/")

  // Example of using the useApiMutation hook for POST requests
  const { submit: createUser, loading: createLoading, error: createError } = useApiMutation("/users/")

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData(e.target)
      const userData = {
        name: formData.get("name"),
        email: formData.get("email"),
        role: formData.get("role"),
      }

      await createUser(userData)
      e.target.reset()
      refetchUsers()
    } catch (error) {
      console.error("Failed to create user:", error)
    }
  }

  return (
    <div className="example-component">
      <div className="api-info">
        <h3>API Configuration</h3>
        <p>API URL: {import.meta.env.DEV ? API_URL : "Hidden in production"}</p>
      </div>

      <div className="users-section">
        <h3>Users</h3>
        {usersLoading ? (
          <p>Loading users...</p>
        ) : usersError ? (
          <div className="error-message">
            <p>Error loading users: {usersError}</p>
            <button onClick={refetchUsers}>Retry</button>
          </div>
        ) : (
          <ul>
            {users &&
              users.map((user) => (
                <li key={user.id}>
                  {user.name} ({user.email}) - {user.role}
                </li>
              ))}
          </ul>
        )}
      </div>

      <div className="create-user-form">
        <h3>Create New User</h3>
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select id="role" name="role">
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <button type="submit" disabled={createLoading}>
            {createLoading ? "Creating..." : "Create User"}
          </button>

          {createError && <p className="error-message">Error: {createError}</p>}
        </form>
      </div>
    </div>
  )
}

