import { createFileRoute } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/learn/contests")({
  head: () => ({
    meta: [
      { title: "Contest Arena — PlaceIQ" },
      { name: "description", content: "Timed contests and rankings." },
    ],
  }),
  component: () => (<RequireAuth>
      <ContestsPage />
    </RequireAuth>),
});

function ContestsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Zap className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">Contest arena</h1>
      <p className="text-muted-foreground mt-2">Compete in timed contests and climb the leaderboard.</p>
    </div>
  );
}
