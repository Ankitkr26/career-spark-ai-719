import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/resumes")({
  head: () => ({
    meta: [
      { title: "Resumes — PlaceIQ" },
      { name: "description", content: "Upload and analyze your resumes." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <ComingSoon />
    </RequireAuth>
  ),
});

function ComingSoon() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
      <h1 className="text-3xl font-bold">Resume analyzer</h1>
      <p className="mt-2 text-muted-foreground">
        Drag-and-drop upload + AI analysis is being built next. Stay tuned!
      </p>
    </div>
  );
}