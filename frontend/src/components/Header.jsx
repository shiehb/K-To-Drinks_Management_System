import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useAuth } from "../context/AuthContext";
import "../css/header.css";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuHovered, setMenuHovered] = useState(false);
  const [toastId, setToastId] = useState(null); // State to track the toast ID

  const userName = user?.username || "Username";
  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    if (isMenuOpen && !menuHovered) {
      const timer = setTimeout(() => {
        setIsMenuOpen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isMenuOpen, menuHovered]);

  const handleLogoutClick = () => {
    if (toastId !== null) {
      toast.dismiss(toastId); // Dismiss the existing toast if any
    }

    const id = toast.warn(
      <div style={{ border: '1px solid black', padding: '10px', borderRadius: '8px', margin: '5px', backgroundColor: '#fffbfc' }}>
        <p style={{ display: 'flex', justifyContent: 'center', textAlign: 'center', gap: '10px', margin: '5px' }}>Are you sure you want to logout?</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '15px 5px' }}>
          <button
            onClick={() => {
              logout();
              navigate('/');
              toast.dismiss(id);
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
            onClick={() => toast.dismiss(id)}
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
        onClose: () => setToastId(null), // Reset the toast ID when the toast is closed
      }
    );

    setToastId(id); // Store the toast ID
  };

  return (
    <>
      <header className="top-header" role="banner">
        <div className="company-name">
          <div className="title-top">K-TO-DRINKS</div>
          <div className="title-bottom">TRADING</div>
        </div>
        <div className="user-name" aria-label="User name">
            <span>Welcome, </span> {userName}
          </div>
        <div className="header-item">
          
          <div
            className="menu-icon"
            onClick={toggleMenu}
            role="button"
            tabIndex="0"
            aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
            onKeyDown={(e) => e.key === "Enter" && toggleMenu()}
          >
            {isMenuOpen ? (
              <i className="fa-solid fa-xmark"></i>
            ) : (
              <i className="fa-solid fa-ellipsis-vertical"></i>
            )}
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div
          className="menu-dropdown"
          onMouseEnter={() => setMenuHovered(true)}
          onMouseLeave={() => setMenuHovered(false)}
          role="menu"
        >
          <ul>
            {/* Display first name and last name */}
            <li role="menuitem">
              {firstName} {lastName}
            </li>

            {/* Notification Section */}
            <li role="menuitem" >
              <span className="material-icons nav-icon">notifications</span>
              Notifications
            </li>

            {/* Show Report Section */}
            <li role="menuitem">
              <span className="material-icons nav-icon">assessment</span>
              Reports
            </li>

            {/* Logout Button */}
            <li
              role="menuitem"
              className="logout-item"
              onClick={handleLogoutClick}
            >
              <span className="material-icons nav-icon">logout</span> {/* Logout icon */}
              Log out
            </li>
          </ul>
        </div>
      )}
    </>
  );
}