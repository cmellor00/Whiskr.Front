import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();
import { API } from "../api/apiContext";



export function AuthProvider({ children }) {
    const [tokenState, setTokenState] = useState(() => localStorage.getItem("token"));

    const setToken = (newToken) => {
        if (newToken) {
            localStorage.setItem("token", newToken);
        } else {
            localStorage.removeItem("token");
        }
        setTokenState(newToken);
    };

    const register = async (credentials) => {
        const response = await fetch(API + "/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });
        const result = await response.json();
        if (!response.ok) throw result;
        setToken(result.token);
    };

    const login = async (credentials) => {
        const response = await fetch(API + "/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });
        const result = await response.json();
        if (!response.ok) throw result;
        setToken(result.token);
    };

    const logout = () => setToken(null);

    return (
        <AuthContext.Provider value={{ token: tokenState, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw Error("useAuth must be used within AuthProvider");
    return context;
}
