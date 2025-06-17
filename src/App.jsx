import React from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./components/Home";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Recipes from "./components/Recipes";
import Pantry from "./components/Pantry";

function App() {
    return (
        <div>
            <NavBar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/pantry" element={<Pantry />} />
            </Routes>
        </div>
    );
}

export default App;
