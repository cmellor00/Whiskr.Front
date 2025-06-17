import React, { useEffect, useState } from "react";
import { API } from "../api/apiContext";
import { useAuth } from "../auth/AuthContext";
import RecipeCard from "./recipeCard";


function Recipes() {
    const [recipes, setRecipes] = useState([]);
    const [error, setError] = useState("");
    const [expandedRecipeId, setExpandedRecipeId] = useState(null);
    const [ingredientsById, setIngredientsById] = useState({});

    const toggleIngredients = async (id) => {
        if (expandedRecipeId === id) {
            setExpandedRecipeId(null);
            return;
        }


        if (!ingredientsById[id]) {
            try {
                const res = await fetch(`${API}/recipes/${id}/ingredients`);
                const data = await res.json();
                setIngredientsById((prev) => ({ ...prev, [id]: data }));
            } catch (err) {
                console.error("Error fetching ingredients:", err);
                setError("Failed to load ingredients.");
                return;
            }
        }

        setExpandedRecipeId(id);
    };

    useEffect(() => {
        fetch(`${API}/recipes`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then((data) => setRecipes(data))
            .catch((err) => {
                console.error("Error fetching recipes:", err);
                setError("Failed to load recipes.");
            });
    }, []);

    const { token } = useAuth(); // get user token

    const handleSave = async (id) => {
        try {
            console.log("🔐 Token being sent:", token);
            const res = await fetch(`${API}/saved`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ recipeId: id }),
            });
            if (!res.ok) throw new Error("Save failed");
            alert("Recipe saved!");
        } catch (err) {
            console.error(err);
            alert("Could not save recipe.");
        }
    };


    return (
        <div>
            <h2>📖 Recipes</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <ul>
                {recipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
            </ul>
        </div>
    );
}

export default Recipes;






