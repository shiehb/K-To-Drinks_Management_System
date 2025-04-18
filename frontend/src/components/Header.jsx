"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useAuth } from "../context/AuthContext"
import "../css/header.css"

export default function Header({ toggleSidebar, sidebarOpen, toggleSidebarVisibility, sidebarHidden }) {
  const navigate = useNavigate()
  const { user, logout, darkMode, toggleDarkMode } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [menuHovered, setMenuHovered] = useState(false)
  const [toastId, setToastId] = useState(null)

  // Extract user information from the auth context
  const userName = user?.username || "Username"
  const firstName = user?.firstName || ""
  const lastName = user?.lastName || ""
  const displayName = firstName && lastName ? `${firstName} ${lastName}` : userName

  // Apply dark mode class to body when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev)
  }

  useEffect(() => {
    if (isMenuOpen && !menuHovered) {
      const timer = setTimeout(() => {
        setIsMenuOpen(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isMenuOpen, menuHovered])

  const handleLogoutClick = () => {
    if (toastId !== null) {
      toast.dismiss(toastId)
    }

    const id = toast.warn(
      <div className="logout-confirmation">
        <p>Are you sure you want to logout?</p>
        <div className="logout-buttons">
          <button
            onClick={() => {
              logout()
              navigate("/")
              toast.dismiss(id)
            }}
            className="btn-yes"
          >
            Yes
          </button>
          <button onClick={() => toast.dismiss(id)} className="btn-no">
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
        onClose: () => setToastId(null),
      },
    )

    setToastId(id)
  }

  return (
    <>
      {/* Skip to content link for keyboard users */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      <header className={`top-header ${darkMode ? 'dark' : ''}`} role="banner">
        <div className="header-left">
          <div className="header-controls">
            <button
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              aria-expanded={sidebarOpen}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <span className="material-icons" aria-hidden="true">
                {sidebarOpen ? "menu_open" : "menu"}
              </span>
            </button>
          </div>

          <div className="company-name">
            <div className="title-top">K-TO-DRINKS</div>
            <div className="title-bottom">TRADING</div>
          </div>
        </div>

        <div className="header-center">
          <div className="user-name" aria-label="User name">
            <span>Welcome, </span> {displayName}
          </div>
        </div>

        <div className="header-right">
          {/* Dark Mode Toggle */}
          <button
            className="dark-mode-toggle"
            onClick={toggleDarkMode}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={darkMode}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="material-icons" aria-hidden="true">
              {darkMode ? "light_mode" : "dark_mode"}
            </span>
          </button>

          <div
            className="menu-icon"
            onClick={toggleMenu}
            role="button"
            tabIndex="0"
            aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
            onKeyDown={(e) => e.key === "Enter" && toggleMenu()}
          >
            {isMenuOpen ? (
              <span className="material-icons" aria-hidden="true">
                close
              </span>
            ) : (
              <span className="material-icons" aria-hidden="true">
                account_circle
              </span>
            )}
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div
          className={`menu-dropdown ${darkMode ? 'dark' : ''}`}
          onMouseEnter={() => setMenuHovered(true)}
          onMouseLeave={() => setMenuHovered(false)}
          role="menu"
          aria-label="User menu"
        >
          <ul>
            <li role="menuitem" className="user-profile">
              <span className="material-icons profile-icon" aria-hidden="true">
                account_circle
              </span>
              <div>
                <div className="user-full-name">
                  {firstName} {lastName}
                </div>
                <div className="user-username">{userName}</div>
              </div>
            </li>

            <li role="menuitem" className="menu-item">
              <span className="material-icons nav-icon" aria-hidden="true">
                notifications
              </span>
              Notifications
            </li>

            <li role="menuitem" className="menu-item">
              <span className="material-icons nav-icon" aria-hidden="true">
                assessment
              </span>
              Reports
            </li>

            <li role="menuitem" className="menu-item" onClick={toggleDarkMode}>
              <span className="material-icons nav-icon" aria-hidden="true">
                {darkMode ? "light_mode" : "dark_mode"}
              </span>
              {darkMode ? "Light Mode" : "Dark Mode"}
            </li>

            <li role="menuitem" className="menu-item logout-item" onClick={handleLogoutClick}>
              <span className="material-icons nav-icon" aria-hidden="true">
                logout
              </span>
              Log out
            </li>
          </ul>
        </div>
      )}
    </>
  )
}