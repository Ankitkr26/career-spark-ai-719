import { createContext, useContext, useEffect, useMemo, useState, } from "react";
const AuthContext = createContext(undefined);
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const STORAGE_TOKEN = "placeiq_token";
const STORAGE_USER = "placeiq_user";
export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const saveAuthState = (token, userData) => {
        setSession({ access_token: token, user: userData });
        setUser(userData);
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_TOKEN, token);
            localStorage.setItem(STORAGE_USER, JSON.stringify(userData));
        }
    };
    const clearAuthState = () => {
        setSession(null);
        setUser(null);
        if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_TOKEN);
            localStorage.removeItem(STORAGE_USER);
        }
    };
    const fetchJson = async (path, options = {}) => {
        const response = await fetch(`${API_BASE}${path}`, options);
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
        if (!response.ok) {
            throw new Error((data?.detail) || (data?.error) || response.statusText);
        }
        return data;
    };
    const loadProfile = async (token) => {
        const data = await fetchJson("/api/auth/me/", {
            headers: {
                Authorization: `Token ${token}`,
            },
        });
        saveAuthState(token, data);
        return data;
    };
    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem(STORAGE_TOKEN) : null;
        if (!token) {
            setLoading(false);
            return;
        }
        loadProfile(token)
            .catch(() => clearAuthState())
            .finally(() => setLoading(false));
    }, []);
    const signIn = async ({ email, password }) => {
        setLoading(true);
        try {
            const data = await fetchJson("/api/auth/login/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: email, password }),
            });
            saveAuthState(data.token, data.user);
            return data;
        }
        finally {
            setLoading(false);
        }
    };
    const signUp = async ({ email, password, displayName }) => {
        setLoading(true);
        try {
            const username = email;
            const data = await fetchJson("/api/auth/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password, first_name: displayName }),
            });
            saveAuthState(data.token, data.user);
            return data;
        }
        finally {
            setLoading(false);
        }
    };
    const signOut = async () => {
        try {
            if (session?.access_token) {
                await fetch(`${API_BASE}/api/auth/logout/`, {
                    method: "POST",
                    headers: {
                        Authorization: `Token ${session.access_token}`,
                    },
                });
            }
        }
        catch (_err) {
            // ignore network failures during logout
        }
        clearAuthState();
    };
    const value = useMemo(() => ({
        session,
        user,
        isAdmin: user?.role === "admin",
        isAuthenticated: !!session,
        loading,
        signOut,
        signIn,
        signUp,
        refreshRoles: async () => {
            if (session?.access_token) {
                await loadProfile(session.access_token);
            }
        },
    }), [session, user, loading]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}
