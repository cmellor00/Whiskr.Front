import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Register() {
    const { register } = useAuth();
    const [form, setForm] = useState({ username: "", password: "" });

    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(form);
            navigate("/account");
        } catch (err) {
            setError(err.message || "Registration failed");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Register</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
            />

            <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
            />
            <button type="submit">Register</button>
        </form>
    );
}

export default Register;