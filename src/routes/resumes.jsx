import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FileText, Upload, Loader2, Sparkles, Trash2, Gauge, CheckCircle2, AlertCircle, } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
import { extractResumeText } from "@/lib/extract-resume-text";
import { analyzeResume } from "@/utils/resume-analysis.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
export const Route = createFileRoute("/resumes")({
    head: () => ({
        meta: [
            { title: "Resumes — PlaceIQ" },
            {
                name: "description",
                content: "Upload your resume and get an instant AI-powered ATS score, skills extraction and improvement suggestions.",
            },
        ],
    }),
    component: () => (<RequireAuth>
      <ResumesPage />
    </RequireAuth>),
});
function ResumesPage() {
    const { user, session } = useAuth();
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [analyzingId, setAnalyzingId] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef(null);
    const refresh = useCallback(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/resumes/`, {
          headers: session?.access_token
            ? { Authorization: `Token ${session.access_token}` }
            : undefined,
        });
        if (!res.ok) {
          const t = await res.text().catch(() => res.statusText);
          throw new Error(t || res.statusText);
        }
        const data = await res.json();
        setResumes(data ?? []);
      }
      catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load resumes");
      }
      finally {
        setLoading(false);
      }
    }, [session]);
    useEffect(() => {
        refresh();
    }, [refresh]);
    const handleFiles = async (files) => {
        if (!files || files.length === 0 || !user)
            return;
        const file = files[0];
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File too large (max 10MB)");
            return;
        }
        setUploading(true);
        try {
            // 1) Extract text in browser
            const rawText = await extractResumeText(file);
            if (rawText.length < 50) {
                throw new Error("Couldn't read enough text from this file. Try a different format.");
            }
            // 2) Upload original to storage
            const path = `${user.id}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
            // 2) Upload original to backend storage
            const form = new FormData();
            form.append("file", file);
            const upRes = await fetch(`${API_BASE}/api/uploads/resumes/`, {
              method: "POST",
              headers: session?.access_token ? { Authorization: `Token ${session.access_token}` } : undefined,
              body: form,
            });
            if (!upRes.ok) {
              const t = await upRes.text().catch(() => upRes.statusText);
              throw new Error(t || "Upload failed");
            }
            const uploaded = await upRes.json();
            const pathReturned = uploaded.file_path;
            // 3) Insert resume row via backend
            const createRes = await fetch(`${API_BASE}/api/resumes/`, {
              method: "POST",
              headers: {
                Authorization: session?.access_token ? `Token ${session.access_token}` : "",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                file_name: file.name,
                file_path: pathReturned,
                raw_text: rawText.slice(0, 60000),
                status: "analyzing",
              }),
            });
            if (!createRes.ok) {
              const t = await createRes.text().catch(() => createRes.statusText);
              throw new Error(t || "Failed to create resume");
            }
            const row = await createRes.json();
            toast.success("Uploaded — running AI analysis…");
            setAnalyzingId(row.id);
            await refresh();
            // 4) Trigger AI analysis
            try {
              await analyzeResume({ data: { resumeId: row.id, rawText: rawText.slice(0, 60000), token: session?.access_token } });
              toast.success("Analysis complete");
            }
            catch (e) {
                toast.error(e instanceof Error ? e.message : "Analysis failed");
            }
            finally {
                setAnalyzingId(null);
                await refresh();
            }
        }
        catch (e) {
            toast.error(e instanceof Error ? e.message : "Upload failed");
        }
        finally {
            setUploading(false);
            if (inputRef.current)
                inputRef.current.value = "";
        }
    };
    const reanalyze = async (r) => {
      if (!session?.access_token)
        return;
      setAnalyzingId(r.id);
      try {
        const res = await fetch(`${API_BASE}/api/resumes/${r.id}/`, {
          headers: { Authorization: `Token ${session.access_token}` },
        });
        if (!res.ok) throw new Error("No text stored for this resume");
        const row = await res.json();
        if (!row?.raw_text) throw new Error("No text stored for this resume");
        await analyzeResume({ data: { resumeId: r.id, rawText: row.raw_text.slice(0, 60000), token: session.access_token } });
        toast.success("Re-analyzed");
        await refresh();
      }
      catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed");
      }
      finally {
        setAnalyzingId(null);
      }
    };
    const remove = async (r) => {
      if (!confirm(`Delete "${r.file_name}"?`))
        return;
      const res = await fetch(`${API_BASE}/api/resumes/${r.id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${session?.access_token}` },
      });
      if (!res.ok) {
        const t = await res.text().catch(() => res.statusText);
        toast.error(t || "Failed to delete");
        return;
      }
      toast.success("Deleted");
      refresh();
    };
    return (<div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-7 w-7 text-primary"/>
          Resume analyzer
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload a PDF, DOCX or TXT resume — get an ATS score, skill breakdown
          and AI-written improvement suggestions.
        </p>
      </div>

      {/* Dropzone */}
      <div onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
        }} onDragLeave={() => setDragOver(false)} onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (!uploading)
                handleFiles(e.dataTransfer.files);
        }} className={`rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border"}`} style={{ background: dragOver ? undefined : "var(--gradient-card)" }}>
        <Upload className="h-10 w-10 text-primary mx-auto mb-3"/>
        <p className="font-medium">Drag & drop your resume here</p>
        <p className="text-sm text-muted-foreground mt-1">
          PDF, DOCX or TXT — up to 10MB
        </p>
        <div className="mt-4">
          <Button onClick={() => inputRef.current?.click()} disabled={uploading} size="lg">
            {uploading ? (<>
                <Loader2 className="h-4 w-4 animate-spin"/> Processing…
              </>) : (<>
                <Upload className="h-4 w-4"/> Choose file
              </>)}
          </Button>
          <input ref={inputRef} type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" className="hidden" onChange={(e) => handleFiles(e.target.files)}/>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your resumes</h2>
        {loading ? (<div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
          </div>) : resumes.length === 0 ? (<div className="rounded-2xl border border-border border-dashed p-10 text-center" style={{ background: "var(--gradient-card)" }}>
            <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2"/>
            <p className="font-medium">No resumes yet</p>
            <p className="text-sm text-muted-foreground">
              Upload one above to see your ATS score and AI insights here.
            </p>
          </div>) : (resumes.map((r) => (<ResumeCard key={r.id} resume={r} busy={analyzingId === r.id} onReanalyze={() => reanalyze(r)} onDelete={() => remove(r)}/>)))}
      </div>
    </div>);
}
function ResumeCard({ resume, busy, onReanalyze, onDelete, }) {
    const score = resume.ats_score ?? 0;
    const scoreColor = score >= 75
        ? "var(--success)"
        : score >= 55
            ? "var(--primary)"
            : score >= 40
                ? "var(--warning)"
                : "var(--destructive)";
    return (<div className="rounded-2xl border border-border p-6" style={{ background: "var(--gradient-card)" }}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary"/>
            <p className="font-medium truncate">{resume.file_name}</p>
            <StatusPill status={resume.status}/>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Uploaded {new Date(resume.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onReanalyze} disabled={busy}>
            {busy ? (<Loader2 className="h-4 w-4 animate-spin"/>) : (<Sparkles className="h-4 w-4"/>)}
            Re-analyze
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} disabled={busy} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4"/>
          </Button>
        </div>
      </div>

      {resume.status === "analyzing" || busy ? (<div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin"/>
          AI is analyzing your resume…
        </div>) : resume.status === "failed" ? (<div className="mt-6 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4"/>
          Analysis failed. Try Re-analyze.
        </div>) : resume.ats_score == null ? null : (<div className="mt-6 grid gap-6 md:grid-cols-[180px_1fr]">
          {/* Score */}
          <div className="rounded-xl border border-border p-4 flex flex-col items-center justify-center text-center" style={{ background: "var(--background)" }}>
            <Gauge className="h-5 w-5 mb-1" style={{ color: scoreColor }}/>
            <p className="text-xs text-muted-foreground">ATS score</p>
            <p className="text-5xl font-bold tracking-tight mt-1" style={{ color: scoreColor }}>
              {score}
            </p>
            <p className="text-xs text-muted-foreground mt-1">/ 100</p>
          </div>

          <div className="space-y-4 min-w-0">
            {resume.summary && (<p className="text-sm leading-relaxed">{resume.summary}</p>)}

            {resume.skills && resume.skills.length > 0 && (<div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Skills detected
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {resume.skills.map((s) => (<Badge key={s} variant="secondary">
                      {s}
                    </Badge>))}
                </div>
              </div>)}

            {resume.missing_skills && resume.missing_skills.length > 0 && (<div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Suggested skills to add
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {resume.missing_skills.map((s) => (<Badge key={s} variant="outline" className="border-warning/40">
                      {s}
                    </Badge>))}
                </div>
              </div>)}

            {resume.suggestions && resume.suggestions.length > 0 && (<div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Improvement suggestions
                </p>
                <ul className="space-y-1.5">
                  {resume.suggestions.map((s, i) => (<li key={i} className="flex gap-2 text-sm leading-relaxed">
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5"/>
                      <span>{s}</span>
                    </li>))}
                </ul>
              </div>)}
          </div>
        </div>)}
    </div>);
}
function StatusPill({ status }) {
    const map = {
        pending: {
            label: "Pending",
            cls: "bg-muted text-muted-foreground",
        },
        analyzing: {
            label: "Analyzing",
            cls: "bg-primary/10 text-primary",
        },
        analyzed: {
            label: "Analyzed",
            cls: "bg-accent/15 text-accent-foreground",
        },
        failed: {
            label: "Failed",
            cls: "bg-destructive/10 text-destructive",
        },
    };
    const v = map[status] ?? map.pending;
    return (<span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${v.cls}`}>
      {v.label}
    </span>);
}
