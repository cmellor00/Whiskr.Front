import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../Styles/theme.css";


function NavBar() {
    const { token, logout } = useAuth();

    return (
        <nav>


            <Link to="/">Home</Link>

            {!token ? (
                <>
                    <Link to="/login" >Login</Link>
                    <Link to="/register">Register</Link>
                </>
            ) : (
                <>
                    <Link to="/recipes" >My Recipe Book</Link>
                    <Link to="/pantry" >My Pantry</Link>
                    <Link to="/addRecipe" >Add Recipe</Link>

                    <button
                        onClick={logout}
                    >
                        Logout
                    </button>
                </>
            )
            }
        </nav >
    );
}

export default NavBar;
