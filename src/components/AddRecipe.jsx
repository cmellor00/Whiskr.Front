import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { API } from "../api/apiContext";

export default function AddRecipe() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [instructions, setInstructions] = useState("");
    const [ingredients, setIngredients] = useState([]);
    const [newIngredient, setNewIngredient] = useState({ name: "", quantity: "", unit: "" });
    const [error, setError] = useState("");
    const { token } = useAuth();
    const navigate = useNavigate();

    const handleAddIngredient = () => {
        if (!newIngredient.name.trim()) return;
        setIngredients([...ingredients, newIngredient]);
        setNewIngredient({ name: "", quantity: "", unit: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API}/recipes`, {

                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // include token like pantry
                },
                body: JSON.stringify({ title, description, instructions, ingredients }),
            });

            if (!res.ok) throw new Error("Failed to create recipe");

            navigate("/recipes");
        } catch (err) {
            console.error(err);
            setError("Failed to add recipe.");
        }
    };

    return (
        <div>
            <h1>Add New Recipe</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title</label><br />
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Description</label><br />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Instructions</label><br />
                    <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        required
                    />
                </div>

                <div style={{ marginTop: "1em" }}>
                    <label>Ingredient</label><br />
                    <input
                        type="text"
                        placeholder="Name"
                        value={newIngredient.name}
                        onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Quantity"
                        value={newIngredient.quantity}
                        onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Unit"
                        value={newIngredient.unit}
                        onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                    />
                    <button type="button" onClick={handleAddIngredient}>Add Ingredient</button>
                </div>

                <ul>
                    {ingredients.map((ing, i) => (
                        <li key={i}>
                            {ing.name} – {ing.quantity} {ing.unit}
                        </li>
                    ))}
                </ul>

                <div style={{ marginTop: "1em" }}>
                    <button type="submit">Create Recipe</button>
                </div>
            </form>
        </div>
    );
}
