import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — PlaceIQ" },
      { name: "description", content: "Contact PlaceIQ support or sales." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="text-center mb-8">
        <Mail className="h-10 w-10 text-primary mx-auto mb-3" />
        <h1 className="text-2xl font-bold">Contact us</h1>
        <p className="text-muted-foreground mt-2">Questions about PlaceIQ? Send us a message.</p>
      </div>

      <form className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input name="name" />
        </div>
        <div>
          <Label>Email</Label>
          <Input name="email" type="email" />
        </div>
        <div>
          <Label>Message</Label>
          <textarea name="message" className="w-full rounded-md border border-border p-2" rows={6} />
        </div>
        <Button type="submit">Send message</Button>
      </form>
    </div>
  );
}
