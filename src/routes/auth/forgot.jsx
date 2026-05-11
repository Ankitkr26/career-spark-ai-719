import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth/forgot")({
  head: () => ({
    meta: [
      { title: "Forgot Password — PlaceIQ" },
      { name: "description", content: "Reset your password." },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Mail className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Forgot password</h1>
          <p className="text-muted-foreground mt-1">Enter your email to receive reset instructions.</p>
        </div>
        <form className="rounded-2xl border border-border p-8" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-3">
            <Label>Email</Label>
            <Input type="email" name="email" />
            <Button type="submit">Send reset email</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
