"use client";

import { Menu } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

import { PersonaSelector } from "./persona-selector";
import { ShareDialog } from "./share-dialog";

interface ChatHeaderProps {
  title: string | null;
  onToggleSidebar: () => void;
  activeConversationId: string | null;
  selectedPersonaSlug: string;
  onSelectPersona: (slug: string) => void;
}

export function ChatHeader({
  title,
  onToggleSidebar,
  activeConversationId,
  selectedPersonaSlug,
  onSelectPersona,
}: ChatHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="size-5" />
        </Button>
        <h1 className="truncate text-lg font-semibold">{title ?? "New Chat"}</h1>
      </div>
      <div className="flex items-center gap-2">
        <PersonaSelector
          selectedPersonaSlug={selectedPersonaSlug}
          onSelectPersona={onSelectPersona}
        />
        {activeConversationId && <ShareDialog conversationId={activeConversationId} />}
        <ThemeToggle />
      </div>
    </header>
  );
}
