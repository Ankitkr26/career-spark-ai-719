import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/learn/dashboard")({
  head: () => ({
    meta: [
      { title: "Learning Dashboard — PlaceIQ" },
      { name: "description", content: "Progress, recommended lessons, and certificates." },
    ],
  }),
  component: () => (<RequireAuth>
      <LearningDashboard />
    </RequireAuth>),
});

function LearningDashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Layout className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">Learning dashboard</h1>
      <p className="text-muted-foreground mt-2">Track your learning progress across roadmaps and lessons.</p>
    </div>
  );
}
