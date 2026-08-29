import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/events', label: 'Events' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/donate', label: 'Donate' },
  { to: '/book-priest', label: 'Book a Priest' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout, isAuthenticated } = useUserAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setOpen(false);
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="navbar-top">
        <div className="navbar-top-inner">
          <span>Sri Lakshmi Venkateswara Temple Trust</span>
          {isAuthenticated ? (
            <span className="navbar-top-account">
              Welcome, {user.name}
              {' · '}
              <button type="button" className="link-button" onClick={handleLogout}>
                Log Out
              </button>
            </span>
          ) : (
            <span className="navbar-top-account">
              <NavLink to="/login">Devotee Login</NavLink>
              {' · '}
              <NavLink to="/register">Register</NavLink>
            </span>
          )}
        </div>
      </div>

      <div className="navbar-inner">
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-om">ॐ</span>
          <span>Sri Lakshmi Venkateswara Temple</span>
        </NavLink>

        <button
          className="nav-toggle"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
