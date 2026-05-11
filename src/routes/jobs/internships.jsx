import { createFileRoute } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/jobs/internships")({
  head: () => ({
    meta: [
      { title: "Internship Portal — PlaceIQ" },
      { name: "description", content: "Find internships and student opportunities." },
    ],
  }),
  component: () => (<RequireAuth>
      <Internships />
    </RequireAuth>),
});

function Internships() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Briefcase className="h-8 w-8 text-primary mb-3" />
      <h1 className="text-2xl font-bold">Internship portal</h1>
      <p className="text-muted-foreground mt-2">Curated internships with eligibility filters and deadlines.</p>
    </div>
  );
}
