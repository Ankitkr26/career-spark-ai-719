import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — PlaceIQ" },
      { name: "description", content: "Account and app settings." },
    ],
  }),
  component: () => (<RequireAuth>
      <SettingsPage />
    </RequireAuth>),
});

function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <Settings className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-muted-foreground mt-2">Manage account, security, and notification preferences.</p>
    </div>
  );
}
