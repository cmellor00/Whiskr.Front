import React, { createContext, useContext, useState, useEffect } from "react";
import { API } from "../api/apiContext";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [tokenState, setTokenState] = useState(() => localStorage.getItem("token"));
    const [user, setUser] = useState(null);

    const setToken = (newToken) => {
        if (newToken) {
            localStorage.setItem("token", newToken);
        } else {
            localStorage.removeItem("token");
        }
        setTokenState(newToken);
    };

    const fetchUser = async (token) => {

        try {
            const response = await fetch(`${API}/users/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                console.log("✅ User fetched:", data);
                setUser(data);
            } else {
                console.error("❌ Failed to fetch user:", data);
                setUser(null);
            }
        } catch (err) {
            console.error("💥 Error fetching user:", err);
            setUser(null);
        }
    };

    useEffect(() => {
        if (tokenState) {
            console.log("🧠 useEffect: tokenState changed:", tokenState);
            fetchUser(tokenState);
        } else {
            setUser(null);
        }
    }, [tokenState]);

    const register = async (credentials) => {
        const res = await fetch(`${API}/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });
        const result = await res.json();
        if (!res.ok) throw result;
        setToken(result.token);
        await fetchUser(result.token);
    };

    const login = async (credentials) => {
        const res = await fetch(`${API}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });
        const result = await res.json();
        if (!res.ok) throw result;
        setToken(result.token);
        await fetchUser(result.token);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token: tokenState, user, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw Error("useAuth must be used within AuthProvider");
    return context;
}
