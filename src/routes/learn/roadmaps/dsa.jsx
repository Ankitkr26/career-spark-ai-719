import { createFileRoute } from "@tanstack/react-router";
import { Hash } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/learn/roadmaps/dsa")({
  head: () => ({
    meta: [
      { title: "DSA Roadmap — PlaceIQ" },
      { name: "description", content: "Data structures & algorithms roadmap." },
    ],
  }),
  component: () => (<RequireAuth>
      <DsaRoadmap />
    </RequireAuth>),
});

function DsaRoadmap() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Hash className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">DSA roadmap</h1>
      <p className="text-muted-foreground mt-2">Step-by-step plan for algorithmic interview readiness.</p>
    </div>
  );
}
