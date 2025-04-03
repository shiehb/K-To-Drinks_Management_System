"use client"

import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import "../css/nav.css"

function NavBar({ isOpen, isMobile, isHidden }) {
  const location = useLocation()
  const [showOrderDropdown, setShowOrderDropdown] = useState(false)

  const navItems = [
    { path: "/user", icon: "people", label: "Manage User" },
    { path: "/dashboard", icon: "dashboard", label: "Dashboard" },
    { path: "/localstore", icon: "store", label: "Local Store" },
    { path: "/inventory", icon: "inventory", label: "Inventory" },
    { path: "/products", icon: "layers", label: "Products" },
  ]

  const toggleOrderDropdown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowOrderDropdown(!showOrderDropdown)
  }

  // Check if current route is order or delivery
  const isOrderActive = location.pathname === "/order" || location.pathname === "/delivery"

  return (
    <nav
      className={`navigation ${isOpen ? "open" : "closed"} ${isMobile ? "mobile" : ""} ${isHidden ? "hidden" : ""}`}
      aria-label="Main Navigation"
      aria-hidden={!isOpen && isMobile}
    >
      <div className="nav-container">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? "active" : ""} ${!isOpen ? "collapsed" : ""}`}
              title={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="material-icons nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          )
        })}

        {/* Order & Delivery Dropdown */}
        <div className="nav-dropdown-container">
          <button
            className={`nav-item dropdown-toggle ${isOrderActive ? "active" : ""} ${!isOpen ? "collapsed" : ""}`}
            onClick={toggleOrderDropdown}
            aria-expanded={showOrderDropdown}
            aria-controls="order-dropdown"
          >
            <span className="material-icons nav-icon" aria-hidden="true">
              shopping_cart
            </span>
            <span className="nav-label">Order & Delivery</span>
            <span className="material-icons dropdown-icon" aria-hidden="true">
              {showOrderDropdown ? "expand_less" : "expand_more"}
            </span>
          </button>

          {showOrderDropdown && (
            <div className="nav-dropdown" id="order-dropdown" role="menu">
              <NavLink
                to="/order"
                className={`nav-dropdown-item ${location.pathname === "/order" ? "active" : ""}`}
                role="menuitem"
                aria-current={location.pathname === "/order" ? "page" : undefined}
              >
                <span className="material-icons nav-icon" aria-hidden="true">
                  receipt
                </span>
                <span className="nav-label">Order</span>
              </NavLink>
              <NavLink
                to="/delivery"
                className={`nav-dropdown-item ${location.pathname === "/delivery" ? "active" : ""}`}
                role="menuitem"
                aria-current={location.pathname === "/delivery" ? "page" : undefined}
              >
                <span className="material-icons nav-icon" aria-hidden="true">
                  local_shipping
                </span>
                <span className="nav-label">Delivery</span>
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default NavBar

