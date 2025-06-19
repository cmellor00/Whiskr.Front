import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { API } from "../api/apiContext";
import RecipeCard from "./RecipeCard";

function Home() {
    const { token } = useAuth();
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [pantry, setPantry] = useState([]);
    const [missingByRecipe, setMissingByRecipe] = useState({});
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            if (!token) return;

            try {
                // Step 1: Load pantry first
                const pantryRes = await fetch(`${API}/pantry`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!pantryRes.ok) throw new Error("Failed to fetch pantry");
                const pantryData = await pantryRes.json();
                setPantry(pantryData);

                // Step 2: Load saved recipes
                const savedRes = await fetch(`${API}/saved`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!savedRes.ok) throw new Error("Failed to fetch saved recipes");
                const savedData = await savedRes.json();
                setSavedRecipes(savedData);

                // Step 3: Compare recipe ingredients to pantry
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

    function getMissingIngredients(recipeIngredients, pantryItems) {
        const pantrySet = new Set(pantryItems.map(i => normalize(i.name)));
        return recipeIngredients.filter(ri => !pantrySet.has(normalize(ri.name)));
    }

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
            setError("Could not load pantry.");
        }
    };

    const fetchSavedRecipes = async () => {
        try {
            const res = await fetch(`${API}/saved`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch saved recipes");
            const data = await res.json();
            setSavedRecipes(data);

            // For each recipe, fetch its ingredients and compare
            const allMissing = {};
            for (const recipe of data) {
                const ingredientRes = await fetch(`${API}/recipes/${recipe.id}/ingredients`);
                const ingredients = await ingredientRes.json();
                allMissing[recipe.id] = getMissingIngredients(ingredients, pantry);
            }
            setMissingByRecipe(allMissing);
        } catch (err) {
            console.error(err);
            setError("Could not load saved recipes or ingredients.");
        }
    };


    const handleRemove = async (recipeId) => {
        try {
            const res = await fetch(`${API}/saved/${recipeId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Delete failed");

            // Refresh state
            setSavedRecipes(savedRecipes.filter((r) => r.id !== recipeId));
            const newMissing = { ...missingByRecipe };
            delete newMissing[recipeId];
            setMissingByRecipe(newMissing);
        } catch (err) {
            console.error(err);
            setError("Failed to remove recipe.");
        }
    };


    return (
        <div>


            {token ? (
                <>
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
                                                    <li key={idx}>{ing.name} – {ing.quantity} {ing.unit}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <button onClick={() => handleRemove(recipe.id)} style={{ marginTop: "0.5em" }}>
                                        ❌ Remove from My Book
                                    </button>
                                </li>
                            ))}
                        </ul>

                    )}
                </>
            ) : (
                <p>Please log in to start saving and viewing recipes from your cookbook.</p>
            )}
        </div>
    );
}

export default Home;
