import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/learn/aptitude")({
  head: () => ({
    meta: [
      { title: "Aptitude Test — PlaceIQ" },
      { name: "description", content: "Timed aptitude tests and scoring." },
    ],
  }),
  component: () => (<RequireAuth>
      <AptitudePage />
    </RequireAuth>),
});

function AptitudePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Clock className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">Aptitude tests</h1>
      <p className="text-muted-foreground mt-2">Timed sections with per-topic scoring and suggestions.</p>
    </div>
  );
}
