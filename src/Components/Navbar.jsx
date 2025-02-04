import React from 'react'
import './Styling/Navbar.css';
import { NavLink } from 'react-router-dom';


function Navbar() {
    return (
        <div className='navbar-container'>
            <div className="navbar-links">
                <ul>
                    <li><NavLink to="/Dashboard" className={({ isActive }) => (isActive ? "active" : "")}>Dashboard</NavLink></li>
                    <li><NavLink to="/Trades" className={({ isActive }) => (isActive ? "active" : "")}>Trades</NavLink></li>
                    <li><NavLink to="/Calculators" className={({ isActive }) => (isActive ? "active" : "")}>Calculators</NavLink></li>
                    <li><NavLink to="/Settings" className={({ isActive }) => (isActive ? "active" : "")}>Settings</NavLink></li>
                    <li><NavLink to="/About" className={({ isActive }) => (isActive ? "active" : "")}>About</NavLink></li>
                </ul>
            </div>
        </div>
    )
}

export default Navbar