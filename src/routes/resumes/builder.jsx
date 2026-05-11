import { createFileRoute } from "@tanstack/react-router";
import { Edit3 } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/resumes/builder")({
  head: () => ({
    meta: [
      { title: "Resume Builder — PlaceIQ" },
      { name: "description", content: "Create and edit resumes with templates." },
    ],
  }),
  component: () => (<RequireAuth>
      <BuilderPage />
    </RequireAuth>),
});

function BuilderPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <Edit3 className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">Resume builder</h1>
      <p className="text-muted-foreground mt-2">Drag-and-drop sections, import extracted content, and export PDF.</p>
    </div>
  );
}
