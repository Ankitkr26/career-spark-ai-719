import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Shield, ShieldOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
export function UsersTab() {
    const { user: me } = useAuth();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const load = async () => {
        setLoading(true);
        const [profR, rolesR, resumesR] = await Promise.all([
            supabase
                .from("profiles")
                .select("id, display_name, headline, created_at")
                .order("created_at", { ascending: false }),
            supabase.from("user_roles").select("user_id, role"),
            supabase.from("resumes").select("user_id, ats_score"),
        ]);
        if (profR.error)
            toast.error(profR.error.message);
        const rolesByUser = new Map();
        (rolesR.data ?? []).forEach((r) => {
            const arr = rolesByUser.get(r.user_id) ?? [];
            arr.push(r.role);
            rolesByUser.set(r.user_id, arr);
        });
        const resumeStats = new Map();
        (resumesR.data ?? []).forEach((r) => {
            const cur = resumeStats.get(r.user_id) ?? { count: 0, best: null };
            cur.count += 1;
            if (typeof r.ats_score === "number") {
                cur.best = cur.best === null ? r.ats_score : Math.max(cur.best, r.ats_score);
            }
            resumeStats.set(r.user_id, cur);
        });
        const enriched = (profR.data ?? []).map((p) => ({
            id: p.id,
            display_name: p.display_name,
            headline: p.headline,
            created_at: p.created_at,
            roles: rolesByUser.get(p.id) ?? [],
            resume_count: resumeStats.get(p.id)?.count ?? 0,
            best_score: resumeStats.get(p.id)?.best ?? null,
        }));
        setRows(enriched);
        setLoading(false);
    };
    useEffect(() => {
        load();
    }, []);
    const toggleAdmin = async (row) => {
        const isAdmin = row.roles.includes("admin");
        if (isAdmin) {
            const { error } = await supabase
                .from("user_roles")
                .delete()
                .eq("user_id", row.id)
                .eq("role", "admin");
            if (error)
                return toast.error(error.message);
            toast.success("Admin role revoked");
        }
        else {
            const { error } = await supabase
                .from("user_roles")
                .insert({ user_id: row.id, role: "admin" });
            if (error)
                return toast.error(error.message);
            toast.success("Admin role granted");
        }
        load();
    };
    if (loading) {
        return (<div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
      </div>);
    }
    return (<div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Users</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {rows.length} registered {rows.length === 1 ? "user" : "users"}
        </p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden" style={{ background: "var(--card)" }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Resumes</TableHead>
              <TableHead>Best ATS</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((u) => {
            const isAdmin = u.roles.includes("admin");
            const isMe = u.id === me?.id;
            return (<TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground"/>
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {u.display_name || "Unnamed"}
                          {isMe && (<span className="ml-2 text-xs text-muted-foreground">(you)</span>)}
                        </p>
                        {u.headline && (<p className="text-xs text-muted-foreground">{u.headline}</p>)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {u.roles.length === 0 && (<Badge variant="outline" className="text-xs">none</Badge>)}
                      {u.roles.map((r) => (<Badge key={r} className={r === "admin"
                        ? "bg-primary/15 text-primary border-0"
                        : "bg-secondary text-secondary-foreground border-0"}>
                          {r}
                        </Badge>))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{u.resume_count}</TableCell>
                  <TableCell className="text-sm">
                    {u.best_score !== null ? (<span className="font-medium">{u.best_score}</span>) : (<span className="text-muted-foreground">—</span>)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {isMe ? (<span className="text-xs text-muted-foreground">—</span>) : (<Button variant="ghost" size="sm" onClick={() => toggleAdmin(u)}>
                        {isAdmin ? (<>
                            <ShieldOff className="h-4 w-4 mr-1.5"/> Revoke admin
                          </>) : (<>
                            <Shield className="h-4 w-4 mr-1.5"/> Make admin
                          </>)}
                      </Button>)}
                  </TableCell>
                </TableRow>);
        })}
          </TableBody>
        </Table>
      </div>
    </div>);
}
