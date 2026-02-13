"use client";

import { Share2 } from "lucide-react";

import { MessageBubble } from "@/components/chat/message-bubble";

interface SharedConversationViewProps {
  title: string;
  messages: Array<{ role: string; content: string }>;
}

export function SharedConversationView({ title, messages }: SharedConversationViewProps) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <Share2 className="text-muted-foreground size-5" />
          <h1 className="text-lg font-semibold">{title}</h1>
          <span className="text-muted-foreground text-sm">(Shared conversation)</span>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto py-4">
        <div className="mx-auto max-w-3xl">
          {messages.map((msg) => (
            <MessageBubble
              key={`${msg.role}-${msg.content.substring(0, 20)}`}
              role={msg.role}
              content={msg.content}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
