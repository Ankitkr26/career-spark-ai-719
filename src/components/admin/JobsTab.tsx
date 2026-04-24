import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Loader2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { JobFormDialog, type JobRow } from "./JobFormDialog";

export function JobsTab() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<JobRow | null>(null);
  const [deleting, setDeleting] = useState<JobRow | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setJobs((data ?? []) as JobRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    if (!deleting) return;
    const { error } = await supabase.from("jobs").delete().eq("id", deleting.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Job deleted");
      load();
    }
    setDeleting(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Job postings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"} in the system
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> New job
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : jobs.length === 0 ? (
        <div
          className="rounded-2xl border border-border border-dashed p-12 text-center"
          style={{ background: "var(--gradient-card)" }}
        >
          <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No jobs yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first posting to make it visible to students.
          </p>
          <Button
            className="mt-5"
            onClick={() => { setEditing(null); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" /> Create job
          </Button>
        </div>
      ) : (
        <div
          className="rounded-xl border border-border overflow-hidden"
          style={{ background: "var(--card)" }}
        >
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
              {jobs.map((j) => (
                <TableRow key={j.id}>
                  <TableCell className="font-medium">{j.title}</TableCell>
                  <TableCell>{j.company}</TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {j.job_type} · {j.experience_level}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[260px]">
                      {(j.required_skills ?? []).slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                      {(j.required_skills ?? []).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{(j.required_skills ?? []).length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {j.is_active ? (
                      <Badge className="bg-success/15 text-success hover:bg-success/20 border-0">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setEditing(j); setDialogOpen(true); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleting(j)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <JobFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        job={editing}
        onSaved={load}
      />

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
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}