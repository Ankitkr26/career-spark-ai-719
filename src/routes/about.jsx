import { createFileRoute } from "@tanstack/react-router";
import { Info } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — PlaceIQ" },
      { name: "description", content: "About PlaceIQ — mission and team." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 text-center">
      <Info className="h-12 w-12 text-primary mx-auto mb-4" />
      <h1 className="text-3xl font-bold">About PlaceIQ</h1>
      <p className="mt-4 text-muted-foreground">
        We help students prepare for placements using AI-driven resume analysis,
        interview practice, and skills recommendations.
      </p>
    </div>
  );
}
