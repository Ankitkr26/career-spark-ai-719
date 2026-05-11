import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, FileText, Sparkles, Target, TrendingUp, MessageSquareText, ArrowRight, CheckCircle2, BookOpen, Edit3, Gauge, Code, } from "lucide-react";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/")({
    head: () => ({
        meta: [
            { title: "PlaceIQ — AI Placement Intelligence & Resume Analyzer" },
            {
                name: "description",
                content: "AI-powered resume analysis, ATS scoring, job matching, and mock interviews to land your dream placement.",
            },
            { property: "og:title", content: "PlaceIQ — AI Placement Intelligence" },
            {
                property: "og:description",
                content: "Upload your resume, get an ATS score, discover matched roles, and practice interviews — all powered by AI.",
            },
        ],
    }),
    component: Landing,
});
const features = [
  {
    icon: FileText,
    title: "Smart Resume Analyzer",
    desc: "Upload PDF/DOCX. AI extracts skills, scores ATS readiness and pinpoints gaps.",
  },
  {
    icon: Edit3,
    title: "Resume Builder",
    desc: "Drag-and-drop builder to craft role-focused resumes and export PDFs.",
  },
  {
    icon: BookOpen,
    title: "Resume Templates",
    desc: "Professional templates for different industries and role levels.",
  },
  {
    icon: Gauge,
    title: "ATS Scoring Dashboard",
    desc: "Visualize ATS score trends and distribution across your uploads.",
  },
  {
    icon: Brain,
    title: "AI Career Assistant",
    desc: "Get tailored roadmaps, role suggestions and cover letters from AI.",
  },
  {
    icon: MessageSquareText,
    title: "Mock Interviews",
    desc: "Role-specific practice with instant AI feedback and scoring.",
  },
  {
    icon: Code,
    title: "Coding Practice & Contests",
    desc: "Solve problems, run tests and compete in timed contests.",
  },
  {
    icon: Target,
    title: "Personalized Job Matching",
    desc: "Per-role match scores with exact skills to improve for each role.",
  },
];
function Landing() {
    return (<>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]"/>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-4 py-1.5 text-sm font-medium text-white border border-white/20 mb-6">
            <Sparkles className="h-4 w-4"/>
            AI-powered placement prep
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Land your dream placement with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-200">
              AI insights
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/85 max-w-2xl mx-auto">
            Upload your resume, get an instant ATS score, see matched jobs, and practice
            interviews — all in one place.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-elegant" style={{ boxShadow: "var(--shadow-elegant)" }}>
              <Link to="/login">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4"/>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white">
              <Link to="/jobs">Explore jobs</Link>
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-white/80">
            {["No credit card", "ATS scoring", "Instant AI feedback"].map((t) => (<div key={t} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4"/> {t}
              </div>))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Everything you need to get hired
          </h2>
          <p className="mt-4 text-muted-foreground">
            From resume polish to interview practice, PlaceIQ guides every step.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (<div key={f.title} className="group rounded-2xl border border-border p-6 transition-all hover:-translate-y-1 hover:border-primary/40" style={{
                background: "var(--gradient-card)",
                boxShadow: "var(--shadow-sm)",
            }}>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl mb-4 group-hover:scale-110 transition-transform" style={{ background: "var(--gradient-primary)" }}>
                <f.icon className="h-5 w-5 text-primary-foreground"/>
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>))}
        </div>
      </section>

      {/* CTA */}
      <section id="get-started" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-3xl p-10 sm:p-14 text-center text-white" style={{
            background: "var(--gradient-primary)",
            boxShadow: "var(--shadow-elegant)",
        }}>
          <Brain className="h-12 w-12 mx-auto mb-4 opacity-90"/>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to ace your placements?
          </h2>
          <p className="mt-4 text-white/85 max-w-xl mx-auto">
            Join students using PlaceIQ to sharpen their resumes and land interviews faster.
          </p>
          <Button asChild size="lg" className="mt-8 bg-white text-primary hover:bg-white/90">
            <Link to="/login">
              Create your account
              <ArrowRight className="ml-2 h-4 w-4"/>
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} PlaceIQ. Built with AI to help students succeed.
        </div>
      </footer>
    </>);
}
