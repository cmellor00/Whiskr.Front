import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../Styles/theme.css";
import "../Styles/mobileStyles.css";

function NavBar() {
    const { token, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);
    const navRef = useRef();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 700);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNavClick = () => {
        if (isMobile) setMenuOpen(false);
    };

    return (
        <nav className="navbar" ref={navRef}>
            <div className="nav-header">
                <span className="logo">Whiskr</span>

                {isMobile && (
                    <button
                        className="menu-toggle"
                        onClick={() => setMenuOpen((prev) => !prev)}
                    >
                        {menuOpen ? "✖" : "☰"}
                    </button>
                )}
            </div>

            <div className={`nav-links ${menuOpen ? "open" : ""}`}>
                <Link to="/" onClick={handleNavClick}>Home</Link>

                {!token ? (
                    <>
                        <Link to="/login" onClick={handleNavClick}>Login</Link>
                        <Link to="/register" onClick={handleNavClick}>Register</Link>
                    </>
                ) : (
                    <>
                        <Link to="/recipes" onClick={handleNavClick}>My Recipe Book</Link>
                        <Link to="/pantry" onClick={handleNavClick}>My Pantry</Link>
                        <Link to="/addRecipe" onClick={handleNavClick}>Add Recipe</Link>
                        <button onClick={() => { logout(); handleNavClick(); }}>Logout</button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default NavBar;
