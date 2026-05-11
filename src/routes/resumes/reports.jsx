import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/resumes/reports")({
  head: () => ({
    meta: [
      { title: "Resume Reports — PlaceIQ" },
      { name: "description", content: "Saved resume reports and exports." },
    ],
  }),
  component: () => (<RequireAuth>
      <ReportsPage />
    </RequireAuth>),
});

function ReportsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <FileText className="h-8 w-8 text-primary mb-3" />
      <h1 className="text-2xl font-bold">Resume reports</h1>
      <p className="text-muted-foreground mt-2">Export, download or share analysis reports for your resumes.</p>
    </div>
  );
}
