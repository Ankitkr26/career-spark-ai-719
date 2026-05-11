import { createFileRoute } from "@tanstack/react-router";
import { List } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/learn/mcq")({
  head: () => ({
    meta: [
      { title: "MCQ Practice — PlaceIQ" },
      { name: "description", content: "Multiple-choice practice by topic." },
    ],
  }),
  component: () => (<RequireAuth>
      <McqPage />
    </RequireAuth>),
});

function McqPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <List className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">MCQ Practice</h1>
      <p className="text-muted-foreground mt-2">Practice conceptual questions with explanations.</p>
    </div>
  );
}
