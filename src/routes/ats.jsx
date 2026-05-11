import { createFileRoute } from "@tanstack/react-router";
import { Gauge } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/ats")({
  head: () => ({
    meta: [
      { title: "ATS Score Dashboard — PlaceIQ" },
      { name: "description", content: "ATS score distribution and trends." },
    ],
  }),
  component: () => (<RequireAuth>
      <AtsPage />
    </RequireAuth>),
});

function AtsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Gauge className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">ATS Score Dashboard</h1>
      <p className="text-muted-foreground mt-2">Aggregate ATS scores and distribution across your uploads.</p>
    </div>
  );
}
