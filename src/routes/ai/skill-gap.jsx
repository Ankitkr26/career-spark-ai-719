import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/ai/skill-gap")({
  head: () => ({
    meta: [
      { title: "Skill Gap Analysis — PlaceIQ" },
      { name: "description", content: "Compare your skills with target roles." },
    ],
  }),
  component: () => (<RequireAuth>
      <SkillGapPage />
    </RequireAuth>),
});

function SkillGapPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Search className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">Skill gap analysis</h1>
      <p className="text-muted-foreground mt-2">See what skills you're missing for a chosen role and study plan.</p>
    </div>
  );
}
