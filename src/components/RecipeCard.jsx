import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { API } from "../api/apiContext";
import "../Styles/home.css";
import "../Styles/mobileStyles.css"

export default function RecipeCard({ recipe, showSaveButton = true }) {
    const [expanded, setExpanded] = useState(false);
    const [ingredients, setIngredients] = useState([]);
    const [error, setError] = useState("");
    const { token } = useAuth();

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

    return (
        <div className="recipe-item">
            <button className="toggle-button" onClick={toggleIngredients}>
                <strong>{recipe.title}</strong>
            </button>
            <p className="recipe-description">{recipe.description}</p>
            {error && <p className="error-message">{error}</p>}

            {expanded && (
                <div className="expanded-content">
                    <h4>🧂 Ingredients</h4>
                    <ul className="ingredient-list">
                        {ingredients.map((ing, idx) => (
                            <li key={idx}>
                                {ing.name} – {ing.quantity} {ing.unit}
                            </li>
                        ))}
                    </ul>
                    <h4>👨‍🍳 Instructions</h4>
                    <p>{recipe.instructions}</p>

                    {showSaveButton && token && (
                        <button className="save-button" onClick={handleSave}>
                            📥 Save to My Book
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
