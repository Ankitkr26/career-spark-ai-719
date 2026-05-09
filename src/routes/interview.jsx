import { createFileRoute } from "@tanstack/react-router";
import { MessageSquareText } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
export const Route = createFileRoute("/interview")({
    head: () => ({
        meta: [
            { title: "Mock Interview — PlaceIQ" },
            { name: "description", content: "AI-generated mock interviews with feedback." },
        ],
    }),
    component: () => (<RequireAuth>
      <ComingSoon />
    </RequireAuth>),
});
function ComingSoon() {
    return (<div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <MessageSquareText className="h-12 w-12 text-primary mx-auto mb-4"/>
      <h1 className="text-3xl font-bold">AI Mock Interview</h1>
      <p className="mt-2 text-muted-foreground">
        Role-based questions and instant AI feedback are coming next.
      </p>
    </div>);
}
