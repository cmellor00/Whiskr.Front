import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { API } from "../api/apiContext";
import RecipeCard from "./RecipeCard";
import "../Styles/home.css";
import "../Styles/savedRecipes.css"
import "../Styles/mobileStyles.css"

function SavedRecipes() {
    const { token } = useAuth();
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [pantry, setPantry] = useState([]);
    const [missingByRecipe, setMissingByRecipe] = useState({});
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            if (!token) return;

            try {
                const pantryRes = await fetch(`${API}/pantry`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!pantryRes.ok) throw new Error("Failed to fetch pantry");
                const pantryData = await pantryRes.json();
                setPantry(pantryData);

                const savedRes = await fetch(`${API}/saved`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!savedRes.ok) throw new Error("Failed to fetch saved recipes");
                const savedData = await savedRes.json();
                setSavedRecipes(savedData);

                const allMissing = {};
                for (const recipe of savedData) {
                    const ingredientRes = await fetch(`${API}/recipes/${recipe.id}/ingredients`);
                    const ingredients = await ingredientRes.json();
                    allMissing[recipe.id] = getMissingIngredients(ingredients, pantryData);
                }
                setMissingByRecipe(allMissing);
            } catch (err) {
                console.error(err);
                setError("Could not load pantry or saved recipes.");
            }
        };

        loadData();
    }, [token]);

    const normalize = (str) => str.trim().toLowerCase();

    const getMissingIngredients = (recipeIngredients, pantryItems) => {
        const pantrySet = new Set(pantryItems.map(i => normalize(i.name)));
        return recipeIngredients.filter(ri => !pantrySet.has(normalize(ri.name)));
    };

    const toggleExpand = (id) => {
        setExpandedIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleUnsave = async (recipeId) => {
        if (!window.confirm("Remove this recipe from your saved list?")) return;

        try {
            const res = await fetch(`${API}/saved/${recipeId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Unsave failed");

            setSavedRecipes((prev) => prev.filter((r) => r.id !== recipeId));
            const updatedMissing = { ...missingByRecipe };
            delete updatedMissing[recipeId];
            setMissingByRecipe(updatedMissing);
            setExpandedIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(recipeId);
                return newSet;
            });
        } catch (err) {
            console.error(err);
            setError("Failed to unsave recipe.");
        }
    };

    return (
        <div className="home-container">
            <h3 className="home-heading">📚 Your Saved Recipes</h3>
            {error && <p className="error-message">{error}</p>}

            {savedRecipes.length === 0 ? (
                <p>You haven't saved any recipes yet.</p>
            ) : (
                <ul className="recipe-list">
                    {savedRecipes.map((recipe) => {
                        const missing = missingByRecipe[recipe.id] || [];
                        const isExpanded = expandedIds.has(recipe.id);

                        return (
                            <li key={recipe.id} className="recipe-item">
                                <RecipeCard recipe={recipe} showSaveButton={false} />

                                {missing.length > 0 ? (
                                    <>
                                        <button
                                            onClick={() => toggleExpand(recipe.id)}
                                            className="toggle-button"
                                        >
                                            {isExpanded ? "Hide Missing Ingredients ❌" : "Show Missing Ingredients ⚠️"}
                                        </button>
                                        {isExpanded && (
                                            <div className="missing-ingredients">
                                                <ul>
                                                    {missing.map((ing, idx) => (
                                                        <li key={idx}>
                                                            {ing.name} – {ing.quantity} {ing.unit}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="has-all-ingredients">✅ All ingredients on hand!</p>
                                )}

                                <button
                                    onClick={() => handleUnsave(recipe.id)}
                                    className="delete-button"
                                >
                                    🗑️ Unsave Recipe
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default SavedRecipes;
