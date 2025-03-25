import React, { useState, useRef } from "react";
import "../css/usermanagement.css";
import { toast } from "react-toastify";

const API_URL = 'http://localhost:8000/api';

// Toast configuration
const toastConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  pauseOnHover: true,
  draggable: true,
  style: {
    backgroundColor: '#fff1f1',
    color: '#007aad',
  },
};

export default function UserManagement({ users, loading, setUsers }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const inputRef = useRef(null);
  const [userForm, setUserForm] = useState({
    id: null,
    username: "",
    name: "",
    email: "",
    role: "employee",
    status: "active",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Handle User Form Submission
  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Check if required fields are filled
    if (!userForm.username || !userForm.name || !userForm.email) {
      toast.error("Username, Name, and Email are required.", toastConfig);
      setIsLoading(false);
      return;
    }

    showConfirmationToast(
      `Are you sure you want to ${userForm.id ? "save changes to" : "add"} this user?`,
      async () => {
        try {
          // Check for duplicates
          const isDuplicateUsername = users.some(
            (user) =>
              user.username.toLowerCase() === userForm.username.toLowerCase() &&
              user.id !== userForm.id
          );
          const isDuplicateName = users.some(
            (user) =>
              user.name.toLowerCase() === userForm.name.toLowerCase() &&
              user.id !== userForm.id
          );
          const isDuplicateEmail = users.some(
            (user) =>
              user.email.toLowerCase() === userForm.email.toLowerCase() &&
              user.id !== userForm.id
          );

          if (isDuplicateUsername) throw new Error("Username is already taken.");
          if (isDuplicateName) throw new Error("Name is already taken.");
          if (isDuplicateEmail) throw new Error("Email is already taken.");

          // Determine the API URL and method
          const url = userForm.id ? `${API_URL}/users/${userForm.id}/` : `${API_URL}/users/`;
          const method = userForm.id ? "PUT" : "POST";

          // Make the API call
          const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userForm),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to save user");
          }

          const data = await response.json();
          if (userForm.id) {
            setUsers(users.map((user) => (user.id === userForm.id ? data : user)));
          } else {
            setUsers([...users, data]);
          }

          toast.success(`User ${userForm.id ? "updated" : "added"} successfully!`, toastConfig);
          setIsUserModalOpen(false);
          setUserForm({
            id: null,
            username: "",
            name: "",
            email: "",
            role: "employee",
            status: "active",
          });
        } catch (error) {
          toast.error(`Failed to save user: ${error.message}`, toastConfig);
        } finally {
          setIsLoading(false);
        }
      }
    );
  };

  // Reusable Confirmation Toast
  const showConfirmationToast = (message, onConfirm) => {
    toast.warn(
      <div style={{ padding: '10px', margin: '5px', backgroundColor: '#fffbfc' }}>
        <p style={{ display: 'flex', justifyContent: 'center', textAlign: 'center', gap: '10px', margin: '5px' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '15px 5px' }}>
          <button
            onClick={() => {
              onConfirm();
              toast.dismiss();
            }}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '10px 40px',
              cursor: 'pointer',
            }}
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss()}
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              padding: '10px 40px',
              cursor: 'pointer',
            }}
          >
            No
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  // Archive User
  const handleArchiveUser = (id) => {
    showConfirmationToast("Are you sure you want to archive this user?", () => confirmArchive(id));
  };

  const confirmArchive = async (id) => {
    try {
      const userToArchive = users.find((user) => user.id === id);
      const response = await fetch(`${API_URL}/users/${id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userToArchive, status: "archived" }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      setUsers(users.map((user) => (user.id === id ? data : user)));
      toast.success("User archived successfully!", toastConfig);
    } catch (error) {
      toast.error(`Failed to archive user: ${error.message}`, toastConfig);
    }
  };

  // Unarchive User
  const handleUnarchiveUser = (id) => {
    showConfirmationToast("Are you sure you want to unarchive this user?", () => confirmUnarchive(id));
  };

  const confirmUnarchive = async (id) => {
    try {
      const userToUnarchive = users.find((user) => user.id === id);
      const response = await fetch(`${API_URL}/users/${id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userToUnarchive, status: "active" }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      setUsers(users.map((user) => (user.id === id ? data : user)));
      toast.success("User unarchived successfully!", toastConfig);
    } catch (error) {
      toast.error(`Failed to unarchive user: ${error.message}`, toastConfig);
    }
  };

  // Filter Users
  const filteredUsers = users.filter(
    (user) =>
      (showArchived ? user.status === "archived" : user.status !== "archived") &&
      (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (roleFilter === "" || user.role === roleFilter)
  );

  // Export Users to CSV
  const exportUsers = () => {
    try {
      if (filteredUsers.length === 0) {
        toast.error("No users to export based on the current filter.", toastConfig);
        return;
      }

      showConfirmationToast("Are you sure you want to export user data?", () => confirmExport());
    } catch (error) {
      toast.error(`Failed to export user data: ${error.message}`, toastConfig);
    }
  };

  const confirmExport = () => {
    try {
      const now = new Date();
      const date = now.toISOString().split("T")[0];
      const time = now.toTimeString().split(" ")[0].replace(/:/g, "-");

      const csvContent =
        "data:text/csv;charset=utf-8," +
        ["ID,Username,Name,Email,Role,Status"]
          .concat(
            filteredUsers.map((user) =>
              `${user.id},${user.username},${capitalizeEachWord(user.name)},${user.email},${user.role},${user.status}`
            )
          )
          .join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `K-TO-DRINK_Trading_users_${date}_${time}.csv`);
      document.body.appendChild(link);
      link.click();

      toast.success("User data exported successfully!", toastConfig);
    } catch (error) {
      toast.error(`Failed to export user data: ${error.message}`, toastConfig);
    }
  };

  // Utility Functions
  const capitalizeEachWord = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  const openUserModal = (user = null) => {
    if (user) {
      setUserForm({ ...user });
    } else {
      setUserForm({ id: null, username: "", name: "", email: "", role: "employee", status: "active" });
    }
    setIsUserModalOpen(true);
  };

  const handleCancel = () => {
    showConfirmationToast("Are you sure you want to cancel? Unsaved changes will be lost.", () => setIsUserModalOpen(false));
  };

  return (
    <div className="user-management">
      <div className="add-user-container">
        <h2>User Management</h2>
        <button onClick={() => openUserModal()}>
          <span className="material-icons nav-icon">add</span>Add User
        </button>
        <button onClick={exportUsers}>Export</button>
      </div>

      <div className="user-container">
        <i className="fas fa-search search-icon"></i>
        <input
          className="input"
          type="text"
          required
          placeholder="Search users..."
          id="search"
          value={searchTerm}
          onChange={handleSearch}
          onFocus={handleFocus}
          ref={inputRef}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="manager">Manager</option>
          <option value="delivery_driver">Delivery Driver</option>
        </select>
        <button onClick={() => setShowArchived(!showArchived)}>
          {showArchived ? "Hide Archived" : "Show Archived"}
        </button>
      </div>
      
{/* Display Total Active Users */}
<div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <p>Total Active Users: {users.filter(user => user.status === "active").length}</p>
        )}
      </div>

      <table className="user-table">
        <colgroup>
          <col style={{ width: "5%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "auto" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "20%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <div className="action-buttons">
                  {user.status !== "archived" && (
                    <button onClick={() => openUserModal(user)}>Edit</button>
                  )}
                  {user.status !== "archived" ? (
                    <button onClick={() => handleArchiveUser(user.id)}>Archive</button>
                  ) : (
                    <button onClick={() => handleUnarchiveUser(user.id)}>Unarchive</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isUserModalOpen && (
        <div className="user-modal">
          <div className="user-modal-content">
            <h3>{userForm.id ? "Edit User" : "Add User"}</h3>
            <form onSubmit={handleUserFormSubmit} className="user-form">
              <label>Username:</label>
              <input
                type="text"
                value={userForm.username}
                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                required
              />
              <label>Full Name:</label>
              <input
                type="text"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: capitalizeEachWord(e.target.value) })}
                required
              />
              <label>Email:</label>
              <input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                required
              />
              <label>Role:</label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              >
                <option value="manager">Manager</option>
                <option value="delivery_driver">Delivery Driver</option>
              </select>
              <button type="submit">{userForm.id ? "Save" : "Add User"}</button>
              <button type="button" onClick={handleCancel}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}