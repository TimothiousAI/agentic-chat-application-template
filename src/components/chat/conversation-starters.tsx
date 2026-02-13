"use client";

import { BookOpen, Code, Lightbulb, MessageCircle, PenTool, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StarterCard {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  prompt: string;
}

const STARTERS: StarterCard[] = [
  {
    icon: PenTool,
    title: "Write a poem",
    prompt: "Write a short, creative poem about artificial intelligence and human connection",
  },
  {
    icon: BookOpen,
    title: "Explain quantum computing",
    prompt: "Explain quantum computing in simple terms that a beginner can understand",
  },
  {
    icon: Code,
    title: "Debug my code",
    prompt: "Help me debug a React component that's not rendering correctly",
  },
  {
    icon: Sparkles,
    title: "Create a recipe",
    prompt: "Create a healthy and easy weeknight dinner recipe using common ingredients",
  },
  {
    icon: Lightbulb,
    title: "Help me brainstorm",
    prompt: "Help me brainstorm creative ideas for a mobile app focused on productivity",
  },
  {
    icon: MessageCircle,
    title: "Summarize a topic",
    prompt: "Provide a concise summary of the key concepts in machine learning",
  },
];

interface ConversationStartersProps {
  onSelect: (prompt: string) => void;
}

export function ConversationStarters({ onSelect }: ConversationStartersProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">How can I help you today?</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Choose a starter or type your own message below
        </p>
      </div>

      <div className="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
        {STARTERS.map((starter) => {
          const Icon = starter.icon;
          return (
            <Button
              key={starter.title}
              variant="outline"
              className={cn(
                "h-auto w-full flex-col items-start gap-2 overflow-hidden p-4 text-left transition-all",
                "hover:border-primary/50 hover:bg-primary/5 hover:shadow-md",
              )}
              onClick={() => onSelect(starter.prompt)}
            >
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                  <Icon className="text-primary size-4" />
                </div>
                <span className="font-medium">{starter.title}</span>
              </div>
              <p className="text-muted-foreground w-full line-clamp-2 text-xs">{starter.prompt}</p>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
