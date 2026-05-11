import { createFileRoute } from "@tanstack/react-router";
import { Award } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/learn/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — PlaceIQ" },
      { name: "description", content: "Top performers and cohorts." },
    ],
  }),
  component: () => (<RequireAuth>
      <LeaderboardPage />
    </RequireAuth>),
});

function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Award className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <p className="text-muted-foreground mt-2">See top students and your cohort rankings.</p>
    </div>
  );
}
