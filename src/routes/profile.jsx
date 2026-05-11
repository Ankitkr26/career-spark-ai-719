import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — PlaceIQ" },
      { name: "description", content: "Your profile details." },
    ],
  }),
  component: () => (<RequireAuth>
      <ProfilePage />
    </RequireAuth>),
});

function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <User className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">Your profile</h1>
      <p className="text-muted-foreground mt-2">Edit your personal information and resume preferences.</p>
    </div>
  );
}
