import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — PlaceIQ" },
      { name: "description", content: "Product features overview." },
    ],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center mb-8">
        <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
        <h1 className="text-3xl font-bold">Features</h1>
        <p className="text-muted-foreground mt-2">Overview of core PlaceIQ capabilities.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border p-6">Smart resume analyzer</div>
        <div className="rounded-2xl border border-border p-6">AI mock interviews</div>
        <div className="rounded-2xl border border-border p-6">Personalized job matching</div>
        <div className="rounded-2xl border border-border p-6">Learning roadmaps</div>
        <div className="rounded-2xl border border-border p-6">Practice problems & contests</div>
        <div className="rounded-2xl border border-border p-6">Analytics & admin tools</div>
      </div>
    </div>
  );
}
