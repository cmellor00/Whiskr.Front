import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function NavBar() {
    const { token, logout } = useAuth();

    return (
        <nav style={{ padding: "1rem", backgroundColor: "#f5f5f5", borderBottom: "1px solid #ccc" }}>


            <Link to="/" style={{ marginRight: "1rem" }}>Home</Link>

            {!token ? (
                <>
                    <Link to="/login" style={{ marginRight: "1rem" }}>Login</Link>
                    <Link to="/register">Register</Link>
                </>
            ) : (
                <>
                    <Link to="/recipes" style={{ marginRight: "1rem" }}>My Recipe Book</Link>
                    <Link to="/pantry" style={{ marginRight: "1rem" }}>My Pantry</Link>
                    <Link to="/addRecipe" style={{ marginRight: "1rem" }}>Add Recipe</Link>

                    <button
                        onClick={logout}
                        style={{
                            background: "none",
                            border: "none",
                            color: "blue",
                            cursor: "pointer",
                            padding: 0,
                            marginLeft: "1rem"
                        }}
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
