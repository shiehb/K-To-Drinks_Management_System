import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import LocalStorePage from './pages/LocalStorePage';
import InventoryPage from './pages/InventoryPage';
import ProductPage from './pages/ProductsPage';
import Order_DeliveryPage from './pages/Order_DeliveryPage';
import DashboardPage from './pages/DashboardPage';
import UserPage from './pages/UserPage';
import { toast } from 'react-toastify'; // Import toast for notifications
import './index.css';

const API_URL = 'http://localhost:8000/api';

// Toast configuration
const toastConfig = {
  position: "top-center",
  autoClose: 5000,
  hideProgressBar: false,
  pauseOnHover: true,
  draggable: true,
  style: {
    backgroundColor: '#fffbfc',
    color: '#007aad',
  },
};

const PrivateRoute = ({ element }) => {
  const { user } = useAuth();
  return user ? element : <Navigate to="/" />;
};

function App() {
  const [users, setUsers] = useState([]); // State to store users
  const [loading, setLoading] = useState(true); // State to track loading status
  const { user } = useAuth(); // Get the authenticated user from AuthContext

  // Fetch Users from API (only if the user is logged in)
  useEffect(() => {
    if (user) { // Check if the user is logged in
      const fetchUsers = async () => {
        try {
          const response = await fetch(`${API_URL}/users/`);
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${errorText}`);
          }
          const data = await response.json();
          setUsers(data);
          toast.success("Users fetched successfully!", toastConfig); // Notify success
        } catch (error) {
          console.error(`Failed to fetch users: ${error.message}`);
          toast.error(`Failed to fetch users: ${error.message}`, toastConfig); // Notify error
        } finally {
          setLoading(false);
        }
      };

      fetchUsers();
    }
  }, [user]); // Fetch users only when the user is logged in

  return (
    <Router>
      {/* Toast Container - should be at root level */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LoginPage />} />

        {/* Private Routes */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <PrivateRoute element={<DashboardPage />} />
            </Layout>
          }
        />
        <Route
          path="/localstore"
          element={
            <Layout>
              <PrivateRoute element={<LocalStorePage />} />
            </Layout>
          }
        />
        <Route
          path="/inventory"
          element={
            <Layout>
              <PrivateRoute element={<InventoryPage />} />
            </Layout>
          }
        />
        <Route
          path="/products"
          element={
            <Layout>
              <PrivateRoute element={<ProductPage />} />
            </Layout>
          }
        />
        <Route
          path="/order_delivery"
          element={
            <Layout>
              <PrivateRoute element={<Order_DeliveryPage />} />
            </Layout>
          }
        />
        <Route
          path="/user"
          element={
            <Layout>
              <PrivateRoute element={<UserPage users={users} loading={loading} setUsers={setUsers} />} />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;