import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  FileText,
  Briefcase,
  MessageSquareText,
  TrendingUp,
  Shield,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — PlaceIQ" },
      { name: "description", content: "Your placement intelligence dashboard." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  ),
});

function Dashboard() {
  const { user, isAdmin, refreshRoles } = useAuth();
  const name = user?.user_metadata?.display_name || user?.email?.split("@")[0];
  const [showClaim, setShowClaim] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      setShowClaim(false);
      return;
    }
    supabase.rpc("admin_exists").then(({ data }) => setShowClaim(!data));
  }, [isAdmin]);

  const handleClaim = async () => {
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_first_admin");
    setClaiming(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data) {
      toast.success("You're now an admin!");
      await refreshRoles();
      setShowClaim(false);
    } else {
      toast.info("An admin already exists.");
      setShowClaim(false);
    }
  };

  const tiles = [
    {
      to: "/resumes",
      icon: FileText,
      title: "Analyze your resume",
      desc: "Upload your resume and get an instant ATS score plus improvement tips.",
      cta: "Upload resume",
    },
    {
      to: "/jobs",
      icon: Briefcase,
      title: "Browse matched jobs",
      desc: "See AI-ranked roles that fit your skills and identify what's missing.",
      cta: "View jobs",
    },
    {
      to: "/interview",
      icon: MessageSquareText,
      title: "Practice an interview",
      desc: "Generate role-specific questions and get AI feedback on every answer.",
      cta: "Start interview",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-1">
          Hi {name} 👋
        </h1>
        <p className="mt-2 text-muted-foreground">
          Here's your placement readiness hub. Start by uploading a resume.
        </p>
      </div>

      {showClaim && (
        <div
          className="mb-8 rounded-2xl border border-primary/30 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="flex items-start gap-3 text-primary-foreground">
            <Shield className="h-6 w-6 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Claim admin access</p>
              <p className="text-sm opacity-90">
                No admin exists yet. As the first user, you can claim the admin role
                to manage jobs and view analytics.
              </p>
            </div>
          </div>
          <Button
            onClick={handleClaim}
            disabled={claiming}
            className="bg-white text-primary hover:bg-white/90 shrink-0"
          >
            {claiming && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Make me admin
          </Button>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {tiles.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="group rounded-2xl border border-border p-6 transition-all hover:-translate-y-1 hover:border-primary/40"
            style={{
              background: "var(--gradient-card)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl mb-4"
              style={{ background: "var(--gradient-primary)" }}
            >
              <t.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{t.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t.desc}</p>
            <span className="text-sm font-medium text-primary inline-flex items-center">
              {t.cta}
              <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>

      <div
        className="rounded-2xl border border-border p-8 text-center"
        style={{ background: "var(--gradient-card)" }}
      >
        <TrendingUp className="h-10 w-10 text-primary mx-auto mb-3" />
        <h2 className="text-xl font-semibold">Placement insights coming up</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Once you upload a resume, you'll see your readiness score, trending market skills,
          and personalized job recommendations here.
        </p>
        <Button asChild className="mt-5">
          <Link to="/resumes">Upload your first resume</Link>
        </Button>
      </div>
    </div>
  );
}