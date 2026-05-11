import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/interviews/feedback")({
  head: () => ({
    meta: [
      { title: "Interview Feedback — PlaceIQ" },
      { name: "description", content: "View feedback for past mock interviews." },
    ],
  }),
  component: () => (<RequireAuth>
      <FeedbackPage />
    </RequireAuth>),
});

function FeedbackPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <CheckCircle2 className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">Interview feedback</h1>
      <p className="text-muted-foreground mt-2">Structured scores and reviewer notes for your practice sessions.</p>
    </div>
  );
}
