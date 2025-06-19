import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { API } from "../api/apiContext";

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
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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
            fetchPantry(); // Refresh pantry list
        } catch (err) {
            console.error(err);
            setError("Failed to add pantry item.");
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API}/pantry/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error("Failed to delete item");
            fetchPantry(); // Refresh list
        } catch (err) {
            console.error(err);
            setError("Failed to delete pantry item.");
        }
    };



    if (!token) return <p>Please log in to view and manage your pantry.</p>;

    return (
        <div>
            <h2>My Pantry</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ marginBottom: "1em" }}>
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

            <ul>
                {pantry.map((item, i) => (
                    <li key={item.id}>
                        {item.name} – {item.quantity} {item.unit}
                        <button onClick={() => handleDelete(item.id)} style={{ marginLeft: "1em" }}>
                            ❌
                        </button>
                    </li>
                ))}
            </ul>


        </div>
    );
}

export default Pantry;
