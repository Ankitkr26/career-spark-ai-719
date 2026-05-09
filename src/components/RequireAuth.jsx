import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";
export function RequireAuth({ children, adminOnly = false, }) {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    if (loading) {
        return (<div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
      </div>);
    }
    if (!isAuthenticated)
        return <Navigate to="/login"/>;
    if (adminOnly && !isAdmin)
        return <Navigate to="/dashboard"/>;
    return <>{children}</>;
}
