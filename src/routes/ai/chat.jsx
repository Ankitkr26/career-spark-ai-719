import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/ai/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — PlaceIQ" },
      { name: "description", content: "Chat with AI about careers and resumes." },
    ],
  }),
  component: () => (<RequireAuth>
      <ChatPage />
    </RequireAuth>),
});

function ChatPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <MessageSquare className="h-10 w-10 text-primary mb-4" />
      <h1 className="text-2xl font-bold">AI Chatbot</h1>
      <p className="text-muted-foreground mt-2">Ask questions about resumes, interviews, and career paths.</p>
    </div>
  );
}
