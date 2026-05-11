import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Loader2, User, Check, X, UserCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export function UsersTab() {
  const { session } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/`, {
        headers: session?.access_token ? { Authorization: `Token ${session.access_token}` } : undefined,
      });
      if (!res.ok) {
        const t = await res.text().catch(() => res.statusText);
        throw new Error(t || res.statusText);
      }
      const data = await res.json();
      setUsers(data ?? []);
    }
    catch (e) {
      // If admin endpoints are not implemented, show helpful message
      setUsers([]);
      toast.error(e instanceof Error ? e.message : "Failed to load users");
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!query) return users;
    const q = query.toLowerCase();
    return users.filter((u) => `${u.email || u.username || ""} ${u.first_name || ""} ${u.last_name || ""}`.toLowerCase().includes(q));
  }, [users, query]);

  const doPatch = async (u, payload) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${u.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: session?.access_token ? `Token ${session.access_token}` : "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
      toast.success("Updated");
      await load();
    }
    catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update user");
    }
  };

  const toggleBlock = async (u) => {
    if (!confirm(`${u.email || u.username} will be ${u.is_blocked ? 'unblocked' : 'blocked'}. Continue?`)) return;
    await doPatch(u, { is_blocked: !u.is_blocked });
  };

  const toggleVerify = async (u) => {
    await doPatch(u, { is_verified: !u.is_verified });
  };

  const setRole = async (u, role) => {
    await doPatch(u, { role });
  };

  return (<div>
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-semibold">Users</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage platform users: verify accounts, block suspicious users, and assign roles.</p>
      </div>
      <div className="flex items-center gap-2">
        <Input placeholder="Search by email or name" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button onClick={load}>Refresh</Button>
      </div>
    </div>

    {loading ? (<div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
      </div>) : filtered.length === 0 ? (<div className="rounded-2xl border border-border border-dashed p-12 text-center" style={{ background: "var(--gradient-card)" }}>
        <User className="h-8 w-8 text-muted-foreground mx-auto mb-3"/>
        <p className="font-medium">No users found</p>
        <p className="text-sm text-muted-foreground mt-1">If admin endpoints are not available, implement `/api/admin/users/` on the backend.</p>
      </div>) : (<div className="rounded-xl border border-border overflow-hidden" style={{ background: "var(--card)" }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Blocked</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (<TableRow key={u.id}>
                <TableCell className="font-medium">{u.email ?? u.username}</TableCell>
                <TableCell>{(u.first_name || "") + (u.last_name ? ` ${u.last_name}` : "")}</TableCell>
                <TableCell>{u.role ?? "student"}</TableCell>
                <TableCell>{u.is_verified ? (<Badge className="bg-accent/15 text-accent-foreground">Verified</Badge>) : (<Badge variant="outline">Unverified</Badge>)}</TableCell>
                <TableCell>{u.is_blocked ? (<Badge className="bg-destructive/10 text-destructive">Blocked</Badge>) : (<Badge variant="outline">Active</Badge>)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => toggleVerify(u)}>
                      {u.is_verified ? <UserCheck className="h-4 w-4 mr-2"/> : <Check className="h-4 w-4 mr-2"/>}
                      {u.is_verified ? "Unverify" : "Verify"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleBlock(u)}>
                      <X className="h-4 w-4 mr-2"/>
                      {u.is_blocked ? "Unblock" : "Block"}
                    </Button>
                    <div className="flex items-center gap-1">
                      <Button size="sm" onClick={() => setRole(u, 'recruiter')}>Make recruiter</Button>
                      <Button size="sm" onClick={() => setRole(u, 'admin')}>Make admin</Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>))}
          </TableBody>
        </Table>
      </div>)}

  </div>);
}
