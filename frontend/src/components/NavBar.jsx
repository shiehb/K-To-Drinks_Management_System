import { NavLink, useLocation } from "react-router-dom"
import "../css/nav.css"

function NavBar({ isOpen, isMobile, isHidden }) {
  const location = useLocation()

  const navItems = [
    { path: "/user", icon: "people", label: "Manage User" },
    { path: "/dashboard", icon: "dashboard", label: "Dashboard" },
    { path: "/localstore", icon: "store", label: "Local Store" },
    { path: "/inventory", icon: "inventory", label: "Inventory" },
    { path: "/products", icon: "layers", label: "Products" },
    { path: "/order_delivery", icon: "shopping_cart", label: "Order & Delivery" },
  ]

  return (
    <nav
      className={`navigation ${isOpen ? "open" : "closed"} ${isMobile ? "mobile" : ""} ${isHidden ? "hidden" : ""}`}
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
            >
              <span className="material-icons nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default NavBar

