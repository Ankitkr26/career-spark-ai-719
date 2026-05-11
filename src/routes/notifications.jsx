import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — PlaceIQ" },
      { name: "description", content: "Your notifications." },
    ],
  }),
  component: () => (<RequireAuth>
      <NotificationsPage />
    </RequireAuth>),
});

function NotificationsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <Bell className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">Notifications</h1>
      <p className="text-muted-foreground mt-2">All your notifications, with filters for jobs and interviews.</p>
    </div>
  );
}
