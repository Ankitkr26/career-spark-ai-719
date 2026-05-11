import { createFileRoute } from "@tanstack/react-router";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — PlaceIQ" },
      { name: "description", content: "Plans and pricing." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center mb-8">
        <DollarSign className="h-10 w-10 text-primary mx-auto mb-3" />
        <h1 className="text-3xl font-bold">Pricing</h1>
        <p className="text-muted-foreground mt-2">Flexible plans for students and institutions.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border p-6 text-center">Free<br/><Button className="mt-4">Get started</Button></div>
        <div className="rounded-2xl border border-border p-6 text-center">Pro<br/><Button className="mt-4">Upgrade</Button></div>
        <div className="rounded-2xl border border-border p-6 text-center">Campus<br/><Button className="mt-4">Contact sales</Button></div>
      </div>
    </div>
  );
}
