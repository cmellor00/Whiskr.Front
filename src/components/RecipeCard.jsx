import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { API } from "../api/apiContext";

export default function RecipeCard({ recipe, showSaveButton = true, onDelete }) {
    const [expanded, setExpanded] = useState(false);
    const [ingredients, setIngredients] = useState([]);
    const [error, setError] = useState("");
    const { token, user } = useAuth(); // ensure user includes is_admin

    const isAdmin = user?.is_admin;

    const toggleIngredients = async () => {
        if (expanded) {
            setExpanded(false);
            return;
        }

        try {
            const res = await fetch(`${API}/recipes/${recipe.id}/ingredients`);
            if (!res.ok) throw new Error("Failed to load ingredients");
            const data = await res.json();
            setIngredients(data);
            setExpanded(true);
        } catch (err) {
            console.error(err);
            setError("Could not load ingredients.");
        }
    };

    const handleSave = async () => {
        try {
            const res = await fetch(`${API}/saved`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ recipeId: recipe.id }),
            });
            if (!res.ok) throw new Error("Save failed");
            alert("Recipe saved!");
        } catch (err) {
            console.error(err);
            alert("Could not save recipe.");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this recipe?")) return;
        try {
            const res = await fetch(`${API}/recipes/${recipe.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error("Delete failed");
            alert("Recipe deleted!");

            if (onDelete) onDelete();

        } catch (err) {
            console.error(err);
            alert("Could not delete recipe.");
        }
    };


    return (
        <li style={{ marginBottom: "1em" }}>
            <button onClick={toggleIngredients}>
                <strong>{recipe.title}</strong>
            </button>
            <p>{recipe.description}</p>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {expanded && (
                <div>
                    <h4>🧂 Ingredients</h4>
                    <ul>
                        {ingredients.map((ing, idx) => (
                            <li key={idx}>
                                {ing.name} – {ing.quantity} {ing.unit}
                            </li>
                        ))}
                    </ul>
                    <h4>👨‍🍳 Instructions</h4>
                    <p>{recipe.instructions}</p>

                    {showSaveButton && token && (
                        <button onClick={handleSave}>📥 Save to My Book</button>
                    )}

                    {isAdmin && (
                        <button onClick={handleDelete} style={{ color: "red" }}>
                            ❌ Delete Recipe
                        </button>
                    )}
                </div>
            )}
        </li>
    );
}
