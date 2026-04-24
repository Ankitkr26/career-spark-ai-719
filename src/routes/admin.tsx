import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — PlaceIQ" },
      { name: "description", content: "Admin panel." },
    ],
  }),
  component: () => (
    <RequireAuth adminOnly>
      <ComingSoon />
    </RequireAuth>
  ),
});

function ComingSoon() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
      <h1 className="text-3xl font-bold">Admin panel</h1>
      <p className="mt-2 text-muted-foreground">
        Job management and analytics coming up.
      </p>
    </div>
  );
}