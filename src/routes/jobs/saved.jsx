import { createFileRoute } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/jobs/saved")({
  head: () => ({
    meta: [
      { title: "Saved Jobs — PlaceIQ" },
      { name: "description", content: "Jobs you saved to review later." },
    ],
  }),
  component: () => (<RequireAuth>
      <SavedJobs />
    </RequireAuth>),
});

function SavedJobs() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <Bookmark className="h-8 w-8 text-primary mb-3" />
      <h1 className="text-2xl font-bold">Saved jobs</h1>
      <p className="text-muted-foreground mt-2">Your bookmarked job listings.</p>
    </div>
  );
}
