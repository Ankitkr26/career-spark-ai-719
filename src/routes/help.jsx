import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy } from "lucide-react";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help Center — PlaceIQ" },
      { name: "description", content: "Help articles and guides." },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center mb-8">
        <LifeBuoy className="h-10 w-10 text-primary mx-auto mb-3" />
        <h1 className="text-3xl font-bold">Help Center</h1>
        <p className="text-muted-foreground mt-2">Search help articles or browse common topics.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border p-6">Getting started</div>
        <div className="rounded-2xl border border-border p-6">Resume analyzer</div>
        <div className="rounded-2xl border border-border p-6">Interviews & practice</div>
        <div className="rounded-2xl border border-border p-6">Billing & accounts</div>
      </div>
    </div>
  );
}
