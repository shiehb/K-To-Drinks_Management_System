import React, { useState } from "react";
import UserManagement from "../components/UserManagement"; // Ensure correct import
import Dashboard from "../pages/DashboardPage"; // Ensure correct import
import "../css/navigation.css";

export default function Navigation() {
  const [activeSection, setActiveSection] = useState("Manage User"); // Active section state

  return (
    <>
     <nav className="left-nav">
        <div className="company-name">
          <div className="title-top">K-TO-DRINKS</div>
          <div className="title-bottom">TRADING</div>
        </div>

      <ul>
        {["Dashboard", "Local Store", "Inventory", "Products", "Order and Delivery", "Manage User"].map((item) => (
          <li
            key={item}
            className={`nav-item ${activeSection === item ? "active" : ""}`}
            onClick={() => setActiveSection(item)}
          >
            {item}
          </li>
        ))}
      </ul>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {activeSection === "Dashboard" && (
          <section className="section">
            <Dashboard />
          </section>
        )}
        {activeSection === "Local Store" && (
          <section className="section">
            <h1>Local Store</h1>
            <p>Here you can manage all customer orders and track shipments.</p>
          </section>
        )}
        {activeSection === "Inventory" && (
          <section className="section">
            <h1>Inventory</h1>
            <p>Manage your product inventory and update stock details.</p>
          </section>
        )}
        {activeSection === "Products" && (
          <section className="section">
            <h1>Products</h1>
            <p>Adjust your preferences, security, and system configurations.</p>
          </section>
        )}
        {activeSection === "Order and Delivery" && (
          <section className="section">
            <h1>Order and Delivery</h1>
            <p>Track orders and manage deliveries efficiently.</p>
          </section>
        )}
        {activeSection === "Manage User" && (
          <section className="section">
            <UserManagement />
          </section>
        )}
      </main>
    </>
  );
}
