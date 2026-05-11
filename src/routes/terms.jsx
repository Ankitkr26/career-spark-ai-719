import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — PlaceIQ" },
      { name: "description", content: "Terms and conditions." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (<div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-2xl font-bold">Terms & Conditions</h1>
      <p className="text-sm text-muted-foreground mt-4">This is a placeholder for the terms and conditions.</p>
    </div>);
}
