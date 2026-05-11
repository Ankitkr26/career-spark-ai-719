import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Loader2, Briefcase, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
import { JobFormDialog } from "./JobFormDialog";
export function JobsTab() {
  const { session } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/jobs/`, {
          headers: session?.access_token ? { Authorization: `Token ${session.access_token}` } : undefined,
        });
        if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
        const data = await res.json();
        setJobs(data ?? []);
      }
      catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load jobs");
      }
      finally {
        setLoading(false);
      }
    };
    useEffect(() => {
        load();
    }, []);
    const handleDelete = async () => {
      if (!deleting)
        return;
      try {
        const res = await fetch(`${API_BASE}/api/jobs/${deleting.id}/`, {
          method: "DELETE",
          headers: session?.access_token ? { Authorization: `Token ${session.access_token}` } : undefined,
        });
        if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
        toast.success("Job deleted");
        load();
      }
      catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to delete job");
      }
      setDeleting(null);
    };
    const toggleActive = async (job) => {
      try {
        const res = await fetch(`${API_BASE}/api/jobs/${job.id}/`, {
          method: "PATCH",
          headers: {
            Authorization: session?.access_token ? `Token ${session.access_token}` : "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_active: !job.is_active }),
        });
        if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
        toast.success(job.is_active ? "Deactivated" : "Activated");
        load();
      }
      catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to update job");
      }
    };
    return (<div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Job postings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"} in the system
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2"/> New job
        </Button>
      </div>

      {loading ? (<div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
        </div>) : jobs.length === 0 ? (<div className="rounded-2xl border border-border border-dashed p-12 text-center" style={{ background: "var(--gradient-card)" }}>
          <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3"/>
          <p className="font-medium">No jobs yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first posting to make it visible to students.
          </p>
          <Button className="mt-5" onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2"/> Create job
          </Button>
        </div>) : (<div className="rounded-xl border border-border overflow-hidden" style={{ background: "var(--card)" }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((j) => (<TableRow key={j.id}>
                  <TableCell className="font-medium">{j.title}</TableCell>
                  <TableCell>{j.company}</TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {j.job_type} · {j.experience_level}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[260px]">
                      {(j.required_skills ?? []).slice(0, 3).map((s) => (<Badge key={s} variant="secondary" className="text-xs">
                          {s}
                        </Badge>))}
                      {(j.required_skills ?? []).length > 3 && (<Badge variant="outline" className="text-xs">
                          +{(j.required_skills ?? []).length - 3}
                        </Badge>)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {j.is_active ? (<Badge className="bg-success/15 text-success hover:bg-success/20 border-0">
                        Active
                      </Badge>) : (<Badge variant="outline">Inactive</Badge>)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => toggleActive(j)} title={j.is_active ? "Deactivate" : "Activate"}>
                        {j.is_active ? <X className="h-4 w-4 text-warning"/> : <Check className="h-4 w-4 text-success"/>}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(j); setDialogOpen(true); }}>
                        <Pencil className="h-4 w-4"/>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleting(j)}>
                        <Trash2 className="h-4 w-4 text-destructive"/>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>))}
            </TableBody>
          </Table>
        </div>)}

      <JobFormDialog open={dialogOpen} onOpenChange={setDialogOpen} job={editing} onSaved={load}/>

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this job?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.title}" at {deleting?.company} will be permanently removed.
              All matching applications stay but lose their job link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>);
}
