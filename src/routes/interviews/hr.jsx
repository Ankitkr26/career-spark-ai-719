import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/interviews/hr")({
  head: () => ({
    meta: [
      { title: "HR Interview Practice — PlaceIQ" },
      { name: "description", content: "Behavioral interview practice." },
    ],
  }),
  component: () => (<RequireAuth>
      <HrPractice />
    </RequireAuth>),
});

function HrPractice() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <Users className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">HR interview practice</h1>
      <p className="text-muted-foreground mt-2">Practice behavioral and situational questions with AI feedback.</p>
    </div>
  );
}
