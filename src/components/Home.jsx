import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { API } from "../api/apiContext";
import RecipeCard from "./RecipeCard";
import "./home.css";


function Home() {
    const [recipes, setRecipes] = useState([]);
    const [error, setError] = useState("");
    const { token, user } = useAuth();

    const isAdmin = user?.is_admin;

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

    const handleRemove = async (id) => {
        try {
            const res = await fetch(`${API}/saved/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Delete failed");

            setRecipes((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            console.error(err);
            setError("Failed to remove recipe.");
        }
    };


    const handleDelete = async (recipe) => {
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

            setRecipes((prev) => prev.filter((r) => r.id !== recipe.id)); // remove from list
        } catch (err) {
            console.error(err);
            alert("Could not delete recipe.");
        }
    };


    return (
        <div className="home-container">
            <h2 className="home-heading">📖 Recipes</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {recipes.length === 0 ? (
                <p>No recipes found. Add or save some to get started!</p>
            ) : (
                <ul className="recipe-list">
                    {recipes.map((recipe) => (
                        <li key={recipe.id} className="recipe-item">
                            <RecipeCard
                                recipe={recipe}
                                showSaveButton={true}
                                onDelete={() =>
                                    setRecipes((prev) =>
                                        prev.filter((r) => r.id !== recipe.id)
                                    )
                                }
                            />
                            {isAdmin && (
                                <button
                                    onClick={() => handleDelete(recipe)}
                                    className="delete-button"
                                >
                                    ❌ Delete Recipe
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );


    export default Home;
