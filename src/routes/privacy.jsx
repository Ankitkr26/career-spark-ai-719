import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — PlaceIQ" },
      { name: "description", content: "Privacy policy." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (<div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-2xl font-bold">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mt-4">Your privacy is important. This page contains the privacy policy placeholder.</p>
    </div>);
}
