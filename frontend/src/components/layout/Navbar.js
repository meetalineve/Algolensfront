// frontend/src/components/layout/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './layout.css';

function Navbar({ breadcrumb = '' }) {
  return (
    <nav id="navbar">
      <div id="left-logo">
        <Link to="/" id="logo">
          <span className="logo-white">Algo</span>
          <span className="logo-blue">Lens</span>
          {breadcrumb && <small>{breadcrumb}</small>}
        </Link>
      </div>
      
      <Link to="/login">
        <button id="right-login">LOGIN</button>
      </Link>
    </nav>
  );
}

export default Navbar;