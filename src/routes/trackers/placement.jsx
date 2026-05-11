import { createFileRoute } from "@tanstack/react-router";
import { Slider } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/trackers/placement")({
  head: () => ({
    meta: [
      { title: "Placement Tracker — PlaceIQ" },
      { name: "description", content: "Visual pipeline for placement progress." },
    ],
  }),
  component: () => (<RequireAuth>
      <PlacementTracker />
    </RequireAuth>),
});

function PlacementTracker() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Slider className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">Placement tracker</h1>
      <p className="text-muted-foreground mt-2">Visual pipeline of applications, interviews and offers.</p>
    </div>
  );
}
