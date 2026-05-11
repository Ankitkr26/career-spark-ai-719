import { createFileRoute } from "@tanstack/react-router";
import { Code } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/learn/coding")({
  head: () => ({
    meta: [
      { title: "Coding Practice — PlaceIQ" },
      { name: "description", content: "Solve coding problems with an in-browser editor." },
    ],
  }),
  component: () => (<RequireAuth>
      <CodingPage />
    </RequireAuth>),
});

function CodingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Code className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">Coding practice</h1>
      <p className="text-muted-foreground mt-2">Solve problems, run tests, and track progress.</p>
    </div>
  );
}
