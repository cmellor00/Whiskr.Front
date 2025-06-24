import React from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./components/Home";
import Login from "./auth/Login";
import Register from "./auth/Register";
import SavedRecipes from "./components/SavedRecipes";
import Pantry from "./components/Pantry";
import AddRecipe from "./components/AddRecipe";

function App() {
    return (
        <div>
            <NavBar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/recipes" element={<SavedRecipes />} />
                <Route path="/pantry" element={<Pantry />} />
                <Route path="/addRecipe" element={<AddRecipe />} />
            </Routes>
        </div>
    );
}

export default App;
