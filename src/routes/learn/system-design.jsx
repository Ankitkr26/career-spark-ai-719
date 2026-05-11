import { createFileRoute } from "@tanstack/react-router";
import { LayoutList } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/learn/system-design")({
  head: () => ({
    meta: [
      { title: "System Design Notes — PlaceIQ" },
      { name: "description", content: "System design resources and templates." },
    ],
  }),
  component: () => (<RequireAuth>
      <SystemDesign />
    </RequireAuth>),
});

function SystemDesign() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <LayoutList className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">System design notes</h1>
      <p className="text-muted-foreground mt-2">Reference architectures, checklists and common patterns.</p>
    </div>
  );
}
