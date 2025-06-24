import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { API } from "../api/apiContext";
import BarcodeScanner from "./BarcodeScanner";
import "../Styles/home.css";
import "../Styles/pantry.css";
import "../Styles/mobileStyles.css"

function Pantry() {
    const { token } = useAuth();
    const [pantry, setPantry] = useState([]);
    const [error, setError] = useState("");
    const [form, setForm] = useState({ name: "", quantity: "", unit: "" });

    useEffect(() => {
        if (token) fetchPantry();
    }, [token]);

    const fetchPantry = async () => {
        try {
            const res = await fetch(`${API}/pantry`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch pantry");
            const data = await res.json();
            setPantry(data);
        } catch (err) {
            console.error(err);
            setError("Could not load pantry items.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API}/pantry`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error("Failed to add item");
            setForm({ name: "", quantity: "", unit: "" });
            fetchPantry();
        } catch (err) {
            console.error(err);
            setError("Failed to add pantry item.");
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API}/pantry/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to delete item");
            fetchPantry();
        } catch (err) {
            console.error(err);
            setError("Failed to delete pantry item.");
        }
    };

    if (!token) return <p>Please log in to view and manage your pantry.</p>;

    return (
        <div className="home-container">
            <h2 className="home-heading">🥕 My Pantry</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="pantry-layout">
                <form className="pantry-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Ingredient"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Quantity"
                        value={form.quantity}
                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Unit"
                        value={form.unit}
                        onChange={(e) => setForm({ ...form, unit: e.target.value })}
                        required
                    />
                    <button type="submit">Add</button>
                </form>

                {/* <h3 style={{ marginTop: "2rem" }}>📷 Scan to Add Items</h3>
            <BarcodeScanner /> */}

                <ul className="pantry-list">
                    {pantry.map((item) => (
                        <li key={item.id} className="pantry-item">
                            {item.name} – {item.quantity} {item.unit}
                            <button className="delete-button" onClick={() => handleDelete(item.id)}>
                                ❌
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );

}

export default Pantry;
