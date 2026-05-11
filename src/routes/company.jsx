import { createFileRoute } from "@tanstack/react-router";
import { Building } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/company")({
  head: () => ({
    meta: [
      { title: "Company Insights — PlaceIQ" },
      { name: "description", content: "Company profiles, salaries and interview difficulty." },
    ],
  }),
  component: () => (<RequireAuth>
      <CompanyPage />
    </RequireAuth>),
});

function CompanyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Building className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">Company insights</h1>
      <p className="text-muted-foreground mt-2">Browse company profiles, salary ranges and interview reviews.</p>
    </div>
  );
}
