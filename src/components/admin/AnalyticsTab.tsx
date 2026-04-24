import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  FileText,
  Briefcase,
  Users,
  Gauge,
  Loader2,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ResumeRow = {
  id: string;
  user_id: string;
  ats_score: number | null;
  skills: string[] | null;
  status: string;
  created_at: string;
};

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div
      className="rounded-2xl border border-border p-5"
      style={{ background: "var(--gradient-card)" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div
          className="h-9 w-9 rounded-lg flex items-center justify-center"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Icon className="h-4 w-4 text-primary-foreground" />
        </div>
      </div>
      <p className="text-3xl font-bold mt-3 tracking-tight">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

function scoreBucket(score: number) {
  if (score < 40) return "0-39";
  if (score < 60) return "40-59";
  if (score < 75) return "60-74";
  if (score < 90) return "75-89";
  return "90-100";
}

const BUCKET_ORDER = ["0-39", "40-59", "60-74", "75-89", "90-100"];

export function AnalyticsTab() {
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [jobsCount, setJobsCount] = useState(0);
  const [activeJobs, setActiveJobs] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [appsCount, setAppsCount] = useState(0);

  useEffect(() => {
    (async () => {
      const [resR, jobR, jobActiveR, profR, appR] = await Promise.all([
        supabase.from("resumes").select("id,user_id,ats_score,skills,status,created_at"),
        supabase.from("jobs").select("id", { count: "exact", head: true }),
        supabase
          .from("jobs")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("applications").select("id", { count: "exact", head: true }),
      ]);
      if (resR.error) toast.error(resR.error.message);
      setResumes((resR.data ?? []) as ResumeRow[]);
      setJobsCount(jobR.count ?? 0);
      setActiveJobs(jobActiveR.count ?? 0);
      setUsersCount(profR.count ?? 0);
      setAppsCount(appR.count ?? 0);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const scored = resumes.filter((r) => typeof r.ats_score === "number");
    const avg =
      scored.length === 0
        ? 0
        : Math.round(
            scored.reduce((sum, r) => sum + (r.ats_score ?? 0), 0) / scored.length,
          );

    // Score distribution
    const distribution = BUCKET_ORDER.map((b) => ({ bucket: b, count: 0 }));
    scored.forEach((r) => {
      const b = scoreBucket(r.ats_score!);
      const target = distribution.find((d) => d.bucket === b);
      if (target) target.count += 1;
    });

    // Top skills
    const skillCount = new Map<string, number>();
    resumes.forEach((r) => {
      (r.skills ?? []).forEach((s) => {
        const k = s.trim();
        if (!k) return;
        skillCount.set(k, (skillCount.get(k) ?? 0) + 1);
      });
    });
    const topSkills = [...skillCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill, count]) => ({ skill, count }));

    // Resumes per day (last 14 days)
    const days: { day: string; resumes: number; avg: number }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        resumes: 0,
        avg: 0,
      });
      const dayResumes = resumes.filter((r) => r.created_at.slice(0, 10) === key);
      days[days.length - 1].resumes = dayResumes.length;
      const dayScored = dayResumes.filter((r) => typeof r.ats_score === "number");
      days[days.length - 1].avg = dayScored.length
        ? Math.round(
            dayScored.reduce((s, r) => s + (r.ats_score ?? 0), 0) / dayScored.length,
          )
        : 0;
    }

    return { avg, scoredCount: scored.length, distribution, topSkills, days };
  }, [resumes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const empty = resumes.length === 0;

  return (
    <div className="space-y-8">
      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total users" value={usersCount} />
        <StatCard
          icon={Briefcase}
          label="Jobs"
          value={jobsCount}
          hint={`${activeJobs} active`}
        />
        <StatCard
          icon={FileText}
          label="Resumes uploaded"
          value={resumes.length}
          hint={`${appsCount} applications`}
        />
        <StatCard
          icon={Gauge}
          label="Average ATS score"
          value={stats.scoredCount ? `${stats.avg}` : "—"}
          hint={
            stats.scoredCount
              ? `from ${stats.scoredCount} analyzed`
              : "no resumes scored yet"
          }
        />
      </div>

      {empty ? (
        <div
          className="rounded-2xl border border-border border-dashed p-12 text-center"
          style={{ background: "var(--gradient-card)" }}
        >
          <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No resume data yet</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Once students upload and analyze resumes, ATS trends, score distribution and
            top market skills will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Trend */}
          <div
            className="rounded-2xl border border-border p-6"
            style={{ background: "var(--gradient-card)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Resume activity & ATS trend (last 14 days)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Resumes uploaded per day with the average analyzed score.
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.days} margin={{ left: -10, right: 10, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="resumes"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Resumes"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avg"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Avg ATS"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribution + Top skills */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div
              className="rounded-2xl border border-border p-6"
              style={{ background: "var(--gradient-card)" }}
            >
              <h3 className="font-semibold mb-1">ATS score distribution</h3>
              <p className="text-xs text-muted-foreground mb-4">
                How analyzed resumes score on the ATS scale.
              </p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.distribution} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {stats.distribution.map((entry, idx) => {
                      const colors = [
                        "var(--destructive)",
                        "var(--warning)",
                        "var(--primary)",
                        "var(--primary-glow)",
                        "var(--success)",
                      ];
                      return <Cell key={entry.bucket} fill={colors[idx]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div
              className="rounded-2xl border border-border p-6"
              style={{ background: "var(--gradient-card)" }}
            >
              <h3 className="font-semibold mb-1">Top skills across resumes</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Most common skills detected by the analyzer.
              </p>
              {stats.topSkills.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No skills extracted yet.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={stats.topSkills}
                    layout="vertical"
                    margin={{ left: 0, right: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="skill"
                      width={100}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" fill="var(--primary)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}