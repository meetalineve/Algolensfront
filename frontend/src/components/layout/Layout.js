// frontend/src/components/layout/Layout.js
import React from 'react';
import { Link } from 'react-router-dom';
import './layout.css';

function Layout({ children, breadcrumb }) {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-container">
          <Link to="/" className="logo">ALGO.NET</Link>
          <nav className="main-nav">
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </nav>
          <div className="auth-nav">
            <Link to="/login" className="auth-link">Login</Link>
            <Link to="/signup" className="auth-link signup">Sign Up</Link>
          </div>
        </div>
      </header>
      
      {breadcrumb && (
        <div className="breadcrumb">
          <div className="container">
            {breadcrumb}
          </div>
        </div>
      )}
      
      <main className="main-content">
        {children}
      </main>
      
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} ALGO.NET - All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;