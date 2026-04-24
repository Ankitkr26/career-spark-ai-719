import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type JobRow = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  job_type: string | null;
  description: string;
  required_skills: string[] | null;
  experience_level: string | null;
  salary_range: string | null;
  is_active: boolean;
};

const schema = z.object({
  title: z.string().trim().min(2).max(120),
  company: z.string().trim().min(1).max(120),
  location: z.string().trim().max(120).optional(),
  job_type: z.string().min(1).max(40),
  description: z.string().trim().min(20).max(5000),
  required_skills: z.string().max(500).optional(),
  experience_level: z.string().min(1).max(40),
  salary_range: z.string().trim().max(60).optional(),
  is_active: z.boolean(),
});

const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract"];
const EXPERIENCE = ["Entry", "Mid", "Senior", "Lead"];

export function JobFormDialog({
  open,
  onOpenChange,
  job,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  job?: JobRow | null;
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const isEdit = !!job;
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    job_type: "Full-time",
    description: "",
    required_skills: "",
    experience_level: "Entry",
    salary_range: "",
    is_active: true,
  });

  useEffect(() => {
    if (job) {
      setForm({
        title: job.title,
        company: job.company,
        location: job.location ?? "",
        job_type: job.job_type ?? "Full-time",
        description: job.description,
        required_skills: (job.required_skills ?? []).join(", "),
        experience_level: job.experience_level ?? "Entry",
        salary_range: job.salary_range ?? "",
        is_active: job.is_active,
      });
    } else {
      setForm({
        title: "",
        company: "",
        location: "",
        job_type: "Full-time",
        description: "",
        required_skills: "",
        experience_level: "Entry",
        salary_range: "",
        is_active: true,
      });
    }
  }, [job, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const skills = (parsed.data.required_skills ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setSubmitting(true);
    const payload = {
      title: parsed.data.title,
      company: parsed.data.company,
      location: parsed.data.location || null,
      job_type: parsed.data.job_type,
      description: parsed.data.description,
      required_skills: skills,
      experience_level: parsed.data.experience_level,
      salary_range: parsed.data.salary_range || null,
      is_active: parsed.data.is_active,
    };

    const { error } = isEdit
      ? await supabase.from("jobs").update(payload).eq("id", job!.id)
      : await supabase.from("jobs").insert({ ...payload, created_by: user?.id });

    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(isEdit ? "Job updated" : "Job created");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit job" : "Create job posting"}</DialogTitle>
          <DialogDescription>
            Provide the role details. Required skills are comma-separated.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Acme Inc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Bangalore / Remote"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Salary range</Label>
              <Input
                id="salary"
                value={form.salary_range}
                onChange={(e) => setForm({ ...form, salary_range: e.target.value })}
                placeholder="₹6-10 LPA"
              />
            </div>
            <div className="space-y-2">
              <Label>Job type</Label>
              <Select
                value={form.job_type}
                onValueChange={(v) => setForm({ ...form, job_type: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Experience level</Label>
              <Select
                value={form.experience_level}
                onValueChange={(v) => setForm({ ...form, experience_level: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPERIENCE.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Required skills (comma-separated)</Label>
            <Input
              id="skills"
              value={form.required_skills}
              onChange={(e) => setForm({ ...form, required_skills: e.target.value })}
              placeholder="React, TypeScript, Node.js, SQL"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              rows={6}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the role, responsibilities, and requirements..."
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">
                Visible to students in the jobs feed.
              </p>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => setForm({ ...form, is_active: v })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? "Save changes" : "Create job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}