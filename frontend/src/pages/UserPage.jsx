import UserManagement from "../components/UserManagement"

const UserPage = ({ users, loading, setUsers }) => {
  return (
    <div className="page-container">
      <UserManagement users={users} loading={loading} setUsers={setUsers} />
    </div>
  )
}

export default UserPage

