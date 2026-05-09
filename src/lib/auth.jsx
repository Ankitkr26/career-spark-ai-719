import { createContext, useContext, useEffect, useMemo, useState, } from "react";
import { supabase } from "@/integrations/supabase/client";
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const loadRoles = async (userId) => {
        const { data } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", userId);
        setRoles((data ?? []).map((r) => r.role));
    };
    useEffect(() => {
        // Listener FIRST
        const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession);
            if (newSession?.user) {
                // Defer DB call to avoid deadlock
                setTimeout(() => loadRoles(newSession.user.id), 0);
            }
            else {
                setRoles([]);
            }
        });
        // THEN check existing session
        supabase.auth.getSession().then(({ data: { session: existing } }) => {
            setSession(existing);
            if (existing?.user) {
                loadRoles(existing.user.id).finally(() => setLoading(false));
            }
            else {
                setLoading(false);
            }
        });
        return () => {
            sub.subscription.unsubscribe();
        };
    }, []);
    const value = useMemo(() => ({
        session,
        user: session?.user ?? null,
        roles,
        isAdmin: roles.includes("admin"),
        isAuthenticated: !!session,
        loading,
        signOut: async () => {
            await supabase.auth.signOut();
        },
        refreshRoles: async () => {
            if (session?.user)
                await loadRoles(session.user.id);
        },
    }), [session, roles, loading]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}
