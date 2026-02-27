// frontend/src/components/TopNavbar.jsx

import React from 'react';
import { FaUserCircle, FaBell, FaCog } from 'react-icons/fa'; // Example icons
import { useNavigate } from 'react-router-dom';

// This component provides the top navigation bar with user info and actions.
const TopNavbar = ({ userName }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('handleLogout: Removing authentication data');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    
    // Dispatch custom event to notify App component of logout
    window.dispatchEvent(new CustomEvent('roleChange', { detail: { role: null } }));
    console.log('handleLogout: Dispatched roleChange event with null role');
    console.log('handleLogout: Navigating to /login');
    
    navigate('/login');
  };

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <h1 className="page-title">Dashboard</h1> {/* This could be dynamically set by routes */}
      </div>
      <div className="navbar-right">
        <div className="nav-item">
          <FaBell className="nav-icon" />
        </div>
        <div className="nav-item">
          <FaCog className="nav-icon" />
        </div>
        <div className="nav-item user-info" onClick={handleLogout}>
          <FaUserCircle className="nav-icon" />
          <span className="user-name">{userName}</span>
          <span className="logout-text">(Logout)</span>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;