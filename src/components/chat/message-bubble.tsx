"use client";

import { Bot, ExternalLink, User, Volume2, VolumeX } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { detectArtifacts } from "@/lib/detect-artifacts";
import { cn } from "@/lib/utils";

import { MarkdownContent } from "./markdown-content";
import { MessageActions } from "./message-actions";

interface MessageBubbleProps {
  role: string;
  content: string;
  onRegenerate?: (() => void) | undefined;
  onOpenArtifact?:
    | ((artifact: {
        type: "code" | "text";
        language?: string | undefined;
        content: string;
      }) => void)
    | undefined;
}

export function MessageBubble({ role, content, onRegenerate, onOpenArtifact }: MessageBubbleProps) {
  const isUser = role === "user";
  const [isHovered, setIsHovered] = useState(false);
  const { speak, stop, isSpeaking } = useTextToSpeech();

  const artifacts = useMemo(() => {
    if (isUser) {
      return [];
    }
    return detectArtifacts(content);
  }, [content, isUser]);

  const handleTtsToggle = useCallback(() => {
    if (isSpeaking) {
      stop();
    } else {
      speak(content);
    }
  }, [isSpeaking, stop, speak, content]);

  return (
    <div className={cn("flex gap-3 px-4 py-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="bg-muted ring-primary/20 flex size-8 shrink-0 items-center justify-center rounded-full ring-1">
          <Bot className="text-muted-foreground size-4" />
        </div>
      )}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: hover-only visual effect for showing message actions */}
      <div
        className="flex flex-col gap-2"
        onMouseEnter={() => {
          if (!isUser) {
            setIsHovered(true);
          }
        }}
        onMouseLeave={() => {
          if (!isUser) {
            setIsHovered(false);
          }
        }}
      >
        <div
          className={cn(
            "max-w-[80%] rounded-2xl px-4 py-2.5",
            isUser
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "bg-muted text-foreground",
          )}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          ) : (
            <MarkdownContent content={content} />
          )}
        </div>
        {!isUser && artifacts.length > 0 && (
          <div className="ml-1 flex flex-wrap gap-1">
            {artifacts.map((artifact, idx) => (
              <Button
                key={`artifact-${artifact.language ?? artifact.type}-${idx}`}
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => onOpenArtifact?.(artifact)}
              >
                <ExternalLink className="size-3" />
                Open {artifact.language ?? artifact.type} in Panel
              </Button>
            ))}
          </div>
        )}
        {!isUser && isHovered && (
          <div className="ml-1 flex items-center gap-1">
            <MessageActions content={content} onRegenerate={onRegenerate} />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={handleTtsToggle}
              aria-label={isSpeaking ? "Stop reading" : "Read aloud"}
            >
              {isSpeaking ? <VolumeX className="size-3" /> : <Volume2 className="size-3" />}
              {isSpeaking ? "Stop" : "Read Aloud"}
            </Button>
          </div>
        )}
      </div>
      {isUser && (
        <div className="bg-primary flex size-8 shrink-0 items-center justify-center rounded-full">
          <User className="text-primary-foreground size-4" />
        </div>
      )}
    </div>
  );
}
