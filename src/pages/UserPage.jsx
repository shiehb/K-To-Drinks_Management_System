import React from "react";
import UserManagement from "../components/UserManagement";

const UserPage = ({ users, loading, setUsers }) => {
  return (
    <div>
      <h1>User Management</h1>
      <UserManagement users={users} loading={loading} setUsers={setUsers} />
    </div>
  );
};

export default UserPage;