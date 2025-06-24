import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { API } from "../api/apiContext";
import "../Styles/home.css";
import "../Styles/addRecipe.css"; // New scoped styles
import "../Styles/mobileStyles.css"

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
                    Authorization: `Bearer ${token}`,
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
        <div className="home-container">
            <h2 className="home-heading">➕ Add New Recipe</h2>
            {error && <p className="error-message">{error}</p>}

            <form className="add-recipe-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Instructions</label>
                    <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group ingredient-group">
                    <label>Add Ingredient</label>
                    <div className="ingredient-inputs">
                        <input
                            type="text"
                            placeholder="Name"
                            value={newIngredient.name}
                            onChange={(e) =>
                                setNewIngredient({ ...newIngredient, name: e.target.value })
                            }
                        />
                        <input
                            type="number"
                            placeholder="Quantity"
                            value={newIngredient.quantity}
                            onChange={(e) =>
                                setNewIngredient({ ...newIngredient, quantity: e.target.value })
                            }
                        />
                        <input
                            type="text"
                            placeholder="Unit"
                            value={newIngredient.unit}
                            onChange={(e) =>
                                setNewIngredient({ ...newIngredient, unit: e.target.value })
                            }
                        />
                        <button type="button" onClick={handleAddIngredient}>
                            ➕ Add
                        </button>
                    </div>
                </div>

                <ul className="ingredient-list">
                    {ingredients.map((ing, i) => (
                        <li key={i}>
                            {ing.name} – {ing.quantity} {ing.unit}
                        </li>
                    ))}
                </ul>

                <div className="form-actions">
                    <button type="submit">✅ Create Recipe</button>
                </div>
            </form>
        </div>
    );
}
