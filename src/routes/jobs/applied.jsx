import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/jobs/applied")({
  head: () => ({
    meta: [
      { title: "Applied Jobs — PlaceIQ" },
      { name: "description", content: "Track jobs you've applied to." },
    ],
  }),
  component: () => (<RequireAuth>
      <AppliedJobs />
    </RequireAuth>),
});

function AppliedJobs() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Check className="h-8 w-8 text-primary mb-3" />
      <h1 className="text-2xl font-bold">Applied jobs</h1>
      <p className="text-muted-foreground mt-2">Your application history and statuses.</p>
    </div>
  );
}
