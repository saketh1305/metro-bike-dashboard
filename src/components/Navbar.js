import React from 'react';
import './styles/navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <a className="navbar-brand logo" href="/">MetroBike</a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link" href="/">Home</a>
            </li>
            {/* <li className="nav-item">
              <a className="nav-link" href="/map">Map</a>
            </li> */}
            <li className="nav-item">
              <a className="nav-link" href="/deck-map">Dashboard</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/Dashboard">Stats</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;