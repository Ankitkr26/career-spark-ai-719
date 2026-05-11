import { createFileRoute } from "@tanstack/react-router";
import { Code } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/interviews/technical")({
  head: () => ({
    meta: [
      { title: "Technical Interview Practice — PlaceIQ" },
      { name: "description", content: "Coding and system design practice." },
    ],
  }),
  component: () => (<RequireAuth>
      <TechnicalPractice />
    </RequireAuth>),
});

function TechnicalPractice() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Code className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">Technical interview practice</h1>
      <p className="text-muted-foreground mt-2">Solve coding problems and run tests in the built-in editor.</p>
    </div>
  );
}
