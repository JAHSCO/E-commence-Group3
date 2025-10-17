import { useState, useEffect } from 'react';
import './Nav.css';

function Nav({ onNavigate, cartCount, user, onSignOut }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand" onClick={() => onNavigate('home')}>
          <h1>TechStore</h1>
        </div>

        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            <li onClick={() => { onNavigate('home'); setIsMenuOpen(false); }}>
              Home
            </li>
            <li onClick={() => { onNavigate('items'); setIsMenuOpen(false); }}>
              Items
            </li>
          </ul>
        </div>

        <div className="nav-actions">
          {user ? (
            <div className="user-section">
              <span className="user-email">{user.email}</span>
              <button className="auth-btn" onClick={onSignOut}>Sign Out</button>
            </div>
          ) : (
            <button className="auth-btn" onClick={() => onNavigate('signin')}>
              Sign In
            </button>
          )}

          <button className="cart-btn" onClick={() => onNavigate('cart')}>
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>

        <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
}

export default Nav;
