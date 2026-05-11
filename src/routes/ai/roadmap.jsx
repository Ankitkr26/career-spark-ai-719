import { createFileRoute } from "@tanstack/react-router";
import { Map } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/ai/roadmap")({
  head: () => ({
    meta: [
      { title: "Career Roadmap — PlaceIQ" },
      { name: "description", content: "Role-based learning roadmaps." },
    ],
  }),
  component: () => (<RequireAuth>
      <RoadmapPage />
    </RequireAuth>),
});

function RoadmapPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Map className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">Career roadmap</h1>
      <p className="text-muted-foreground mt-2">Guided learning paths to reach target roles.</p>
    </div>
  );
}
