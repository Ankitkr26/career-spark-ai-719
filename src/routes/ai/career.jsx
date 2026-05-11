import { createFileRoute } from "@tanstack/react-router";
import { Brain } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/ai/career")({
  head: () => ({
    meta: [
      { title: "AI Career Assistant — PlaceIQ" },
      { name: "description", content: "Career suggestions and plans powered by AI." },
    ],
  }),
  component: () => (<RequireAuth>
      <CareerAssistant />
    </RequireAuth>),
});

function CareerAssistant() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <Brain className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">AI Career Assistant</h1>
      <p className="text-muted-foreground mt-2">Get role recommendations, career roadmaps and personalized next-steps.</p>
    </div>
  );
}
