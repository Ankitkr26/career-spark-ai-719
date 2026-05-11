import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/resumes/templates")({
  head: () => ({
    meta: [
      { title: "Resume Templates — PlaceIQ" },
      { name: "description", content: "Choose a resume template." },
    ],
  }),
  component: () => (<RequireAuth>
      <TemplatesPage />
    </RequireAuth>),
});

function TemplatesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <BookOpen className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">Resume templates</h1>
      <p className="text-muted-foreground mt-2">Pick a professional template and apply it to your resume content.</p>
    </div>
  );
}
