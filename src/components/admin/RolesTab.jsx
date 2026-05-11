import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const PERMISSIONS = [
  { key: "manage_users", label: "Manage users" },
  { key: "manage_jobs", label: "Manage jobs" },
  { key: "manage_content", label: "Manage content" },
  { key: "manage_billing", label: "Manage billing" },
  { key: "manage_ai", label: "Configure AI" },
  { key: "manage_interviews", label: "Manage interviews" },
];

export function RolesTab() {
  const { session } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/roles/`, {
        headers: session?.access_token ? { Authorization: `Token ${session.access_token}` } : undefined,
      });
      if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
      setRoles(await res.json());
    }
    catch (e) {
      setRoles([]);
      toast.error(e instanceof Error ? e.message : "Failed to load roles");
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveRole = async (ev) => {
    ev.preventDefault();
    const form = new FormData(ev.currentTarget);
    const name = form.get("name").toString();
    const perms = PERMISSIONS.filter((p) => form.get(`perm_${p.key}`)).map((p) => p.key);
    try {
      const method = editing ? "PATCH" : "POST";
      const url = editing ? `${API_BASE}/api/admin/roles/${editing.id}/` : `${API_BASE}/api/admin/roles/`;
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: session?.access_token ? `Token ${session.access_token}` : "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, permissions: perms }),
      });
      if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
      toast.success("Saved");
      setOpen(false);
      setEditing(null);
      await load();
    }
    catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save role");
    }
  };

  const remove = async (r) => {
    if (!confirm(`Delete role ${r.name}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/roles/${r.id}/`, {
        method: "DELETE",
        headers: session?.access_token ? { Authorization: `Token ${session.access_token}` } : undefined,
      });
      if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
      toast.success("Deleted");
      await load();
    }
    catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete role");
    }
  };

  return (<div>
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-semibold">Roles & Permissions</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Create and manage admin roles and their permissions.</p>
      </div>
      <Button onClick={() => { setEditing(null); setOpen(true); }}>New role</Button>
    </div>

    {loading ? (<div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
      </div>) : roles.length === 0 ? (<div className="rounded-2xl border border-border border-dashed p-12 text-center" style={{ background: "var(--gradient-card)" }}>
        <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3"/>
        <p className="font-medium">No roles</p>
        <p className="text-sm text-muted-foreground mt-1">Create custom roles to restrict admin access by capability.</p>
      </div>) : (<div className="rounded-xl border border-border overflow-hidden" style={{ background: "var(--card)" }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((r) => (<TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{(r.permissions ?? []).join(", ")}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" onClick={() => { setEditing(r); setOpen(true); }}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(r)}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>))}
          </TableBody>
        </Table>
      </div>)}

    <Dialog open={open} onOpenChange={(v) => { if (!v) { setEditing(null); } setOpen(v); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? `Edit role: ${editing.name}` : "New role"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={saveRole} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Name</label>
            <Input name="name" defaultValue={editing?.name ?? ""} required />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Permissions</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PERMISSIONS.map((p) => (<label key={p.key} className="flex items-center gap-2">
                  <Checkbox name={`perm_${p.key}`} defaultChecked={(editing?.permissions ?? []).includes(p.key)} />
                  <span className="text-sm">{p.label}</span>
                </label>))}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>);
}
