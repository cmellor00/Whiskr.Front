import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddRecipe() {
    const [title, setTitle] = useState("");
    const [instructions, setInstructions] = useState("");
    const [ingredients, setIngredients] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch("/api/recipes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                instructions,
                ingredients: ingredients.split(",").map((i) => i.trim()),
            }),
        });
        if (res.ok) {
            navigate("/recipes");
        } else {
            alert("Failed to add recipe.");
        }
    };

    return (
        <div>
            <h1>Add New Recipe</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title</label><br />
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div>
                    <label>Instructions</label><br />
                    <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                    />
                </div>
                <div>
                    <label>Ingredients (comma separated)</label><br />
                    <input
                        type="text"
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                    />
                </div>
                <div>
                    <button type="submit">Add Recipe</button>
                </div>
            </form>
        </div>
    );
}
