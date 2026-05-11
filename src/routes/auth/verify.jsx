import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth/verify")({
  head: () => ({
    meta: [
      { title: "Verify Email — PlaceIQ" },
      { name: "description", content: "Verify your email address." },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="text-muted-foreground mt-2">Check your inbox for a verification link. Resend if needed.</p>
        <div className="mt-6">
          <Button>Resend verification email</Button>
        </div>
      </div>
    </div>
  );
}
