import { createFileRoute } from "@tanstack/react-router";
import { Key } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth/reset")({
  head: () => ({
    meta: [
      { title: "Reset Password — PlaceIQ" },
      { name: "description", content: "Set a new password." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Key className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Reset password</h1>
          <p className="text-muted-foreground mt-1">Enter a new password to complete the reset.</p>
        </div>
        <form className="rounded-2xl border border-border p-8" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-3">
            <Label>New password</Label>
            <Input type="password" name="password" minLength={8} />
            <Label>Confirm password</Label>
            <Input type="password" name="confirm" minLength={8} />
            <Button type="submit">Set password</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
