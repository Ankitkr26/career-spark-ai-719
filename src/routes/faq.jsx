import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — PlaceIQ" },
      { name: "description", content: "Frequently asked questions." },
    ],
  }),
  component: FaqPage,
});

const FAQ_ITEMS = [
  { q: "How does the resume analyzer work?", a: "AI extracts text and scores your resume for ATS compatibility." },
  { q: "What file types are supported?", a: "PDF, DOCX and TXT up to 10MB." },
];

function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="text-center mb-8">
        <HelpCircle className="h-10 w-10 text-primary mx-auto mb-3" />
        <h1 className="text-2xl font-bold">Frequently asked questions</h1>
      </div>
      <div className="space-y-4">
        {FAQ_ITEMS.map((f) => (<div key={f.q} className="rounded-lg border border-border p-4">
            <p className="font-medium">{f.q}</p>
            <p className="text-sm text-muted-foreground mt-1">{f.a}</p>
          </div>))}
      </div>
    </div>
  );
}
