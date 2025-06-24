import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { API } from "../api/apiContext";
import RecipeCard from "./RecipeCard";

function SavedRecipes() {
    const { token } = useAuth();
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [pantry, setPantry] = useState([]);
    const [missingByRecipe, setMissingByRecipe] = useState({});
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            if (!token) return;

            try {
                // Load pantry
                const pantryRes = await fetch(`${API}/pantry`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!pantryRes.ok) throw new Error("Failed to fetch pantry");
                const pantryData = await pantryRes.json();
                setPantry(pantryData);

                // Load saved recipes
                const savedRes = await fetch(`${API}/saved`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!savedRes.ok) throw new Error("Failed to fetch saved recipes");
                const savedData = await savedRes.json();
                setSavedRecipes(savedData);

                // Calculate missing ingredients
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

    const handleUnsave = async (recipeId) => {
        if (!window.confirm("Remove this recipe from your saved list?")) return;

        try {
            const res = await fetch(`${API}/saved/${recipeId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Unsave failed");

            // Update UI
            setSavedRecipes((prev) => prev.filter((r) => r.id !== recipeId));
            const updatedMissing = { ...missingByRecipe };
            delete updatedMissing[recipeId];
            setMissingByRecipe(updatedMissing);
        } catch (err) {
            console.error(err);
            setError("Failed to unsave recipe.");
        }
    };

    return (
        <div>
            <h3>📚 Your Saved Recipes</h3>
            {error && <p style={{ color: "red" }}>{error}</p>}

            {savedRecipes.length === 0 ? (
                <p>You haven't saved any recipes yet.</p>
            ) : (
                <ul>
                    {savedRecipes.map((recipe) => (
                        <li key={recipe.id}>
                            <RecipeCard recipe={recipe} showSaveButton={false} />

                            {missingByRecipe[recipe.id]?.length > 0 && (
                                <div style={{ color: "red" }}>
                                    <strong>❌ Missing Ingredients:</strong>
                                    <ul>
                                        {missingByRecipe[recipe.id].map((ing, idx) => (
                                            <li key={idx}>
                                                {ing.name} – {ing.quantity} {ing.unit}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <button
                                onClick={() => handleUnsave(recipe.id)}
                                style={{ marginTop: "0.5em" }}
                            >
                                🗑️ Unsave Recipe
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default SavedRecipes;
