import { createFileRoute } from "@tanstack/react-router";
import { Ticket } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/support/ticket")({
  head: () => ({
    meta: [
      { title: "Support Ticket — PlaceIQ" },
      { name: "description", content: "Open a support ticket." },
    ],
  }),
  component: () => (<RequireAuth>
      <TicketPage />
    </RequireAuth>),
});

function TicketPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Ticket className="h-12 w-12 text-primary mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-center">Open a support ticket</h1>
      <form className="mt-6 space-y-4">
        <div>
          <Label>Subject</Label>
          <Input name="subject" />
        </div>
        <div>
          <Label>Details</Label>
          <textarea name="details" className="w-full rounded-md border border-border p-2" rows={6} />
        </div>
        <Button type="submit">Create ticket</Button>
      </form>
    </div>
  );
}
