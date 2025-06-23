function Recipes() {
    const [recipes, setRecipes] = useState([]);
    const [error, setError] = useState("");
    const [expandedRecipeId, setExpandedRecipeId] = useState(null);
    const [ingredientsById, setIngredientsById] = useState({});

    const { token } = useAuth();

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

    const handleSave = async (id) => {
        try {
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

    return (
        <div>
            <h2>📖 Recipes</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <ul>
                {recipes.map((recipe) => (
                    <li key={recipe.id}>
                        <RecipeCard recipe={recipe} />
                        <button onClick={() => handleSave(recipe.id)}>💾 Save</button>
                        <button onClick={() => handleRemove(recipe.id)}>❌ Remove</button>
                        <button onClick={() => toggleIngredients(recipe.id)}>
                            {expandedRecipeId === recipe.id ? "Hide Ingredients" : "Show Ingredients"}
                        </button>
                        {expandedRecipeId === recipe.id && ingredientsById[recipe.id] && (
                            <ul>
                                {ingredientsById[recipe.id].map((ing) => (
                                    <li key={ing.id}>{ing.name}</li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
