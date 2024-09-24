import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/Navbar.css'; 

const Navbar = () => {
  
  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li className="dropdown">
          <Link to="/services">Services</Link>
          <ul className="dropdown-menu">
            <li><Link to="/service1">Service 1</Link></li>
            <li><Link to="/service2">Service 2</Link></li>
            <li><Link to="/service3">Service 3</Link></li>
          </ul>
        </li>
        
        <li className="dropdown">
          <Link to="/login">Login</Link>
          <ul className="dropdown-menu">
            <li><Link to="/register">Register</Link></li>
          </ul>
        </li>
      </ul>
      <div className="navbar-address">
        <div>5112 N. Lincoln Ave.</div>
        <div>IL, Chicago 60625</div>
      </div>
    </nav>
  );
};

export default Navbar;
