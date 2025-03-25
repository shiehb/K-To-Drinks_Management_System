import React from "react";
import { NavLink } from "react-router-dom"; // Use NavLink instead of Link
import "../css/nav.css";

function NavBar() {
  return (
    <nav className="navigation">
      <ul>
      <li>
          <NavLink
            to="/user"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            <span className="material-icons nav-icon">people</span> {/* User Management icon */}
            <span>User Management</span> {/* Text */}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            <span className="material-icons nav-icon">dashboard</span> {/* Dashboard icon */}
            <span>Dashboard</span> {/* Text */}
          </NavLink>
        </li>
        <li>
          <NavLink
          to="/localstore"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            <span className="material-icons nav-icon">store</span> {/* User Management icon */}
            <span>Local Store</span> {/* Text */}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/inventory"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            <span className="material-icons nav-icon">inventory</span> {/* User Management icon */}
            <span>Inventory</span> {/* Text */}
          </NavLink>
        </li>
        <li>
          <NavLink
          to="/products"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            <span className="material-icons nav-icon">layers</span> {/* User Management icon */}
            <span>Products</span> {/* Text */}
          </NavLink>
        </li>
        <li>
          <NavLink
          to="/order_delivery"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            <span className="material-icons nav-icon">shopping_cart</span> {/* User Management icon */}
            <span>Order & Delivery</span> {/* Text */}
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;