import { createFileRoute } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
export const Route = createFileRoute("/jobs")({
    head: () => ({
        meta: [
            { title: "Jobs — PlaceIQ" },
            { name: "description", content: "Browse jobs and see your match scores." },
        ],
    }),
    component: () => (<RequireAuth>
      <ComingSoon />
    </RequireAuth>),
});
function ComingSoon() {
    return (<div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <Briefcase className="h-12 w-12 text-primary mx-auto mb-4"/>
      <h1 className="text-3xl font-bold">Jobs & recommendations</h1>
      <p className="mt-2 text-muted-foreground">
        Coming next: matched jobs, trending skills, and per-role gap analysis.
      </p>
    </div>);
}
