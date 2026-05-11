import { createFileRoute } from "@tanstack/react-router";
import { Monitor } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/learn/roadmaps/web")({
  head: () => ({
    meta: [
      { title: "Web Development Roadmap — PlaceIQ" },
      { name: "description", content: "Roadmap for front-end and back-end web development." },
    ],
  }),
  component: () => (<RequireAuth>
      <WebRoadmap />
    </RequireAuth>),
});

function WebRoadmap() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Monitor className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">Web development roadmap</h1>
      <p className="text-muted-foreground mt-2">Guided track for front-end, back-end and deployment skills.</p>
    </div>
  );
}
