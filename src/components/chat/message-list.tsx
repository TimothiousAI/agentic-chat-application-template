"use client";

import { Bot } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { useAutoScroll } from "@/hooks/use-auto-scroll";

import { MessageBubble } from "./message-bubble";

interface Message {
  id: string;
  role: string;
  content: string;
}

interface MessageListProps {
  messages: Message[];
  streamingContent: string;
  isStreaming: boolean;
  onRegenerate?: () => void;
  onOpenArtifact?:
    | ((artifact: {
        type: "code" | "text";
        language?: string | undefined;
        content: string;
      }) => void)
    | undefined;
}

function StreamingText({ content }: { content: string }) {
  const words = content.split(/(\s+)/);

  return (
    <p className="text-sm whitespace-pre-wrap">
      {words.map((word, idx) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: words are positional tokens during streaming
          key={idx}
          className="streaming-word"
          style={{
            animationDelay: `${idx * 0.02}s`,
          }}
        >
          {word}
        </span>
      ))}
      <span className="streaming-cursor ml-0.5 inline-block h-4 w-1.5 align-middle" />
    </p>
  );
}

export function MessageList({
  messages,
  streamingContent,
  isStreaming,
  onRegenerate,
  onOpenArtifact,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollToBottom, isScrolledToBottom } = useAutoScroll(containerRef);
  const prevMessageCountRef = useRef(messages.length);
  const [loadedMessageIds, setLoadedMessageIds] = useState<Set<string>>(new Set());
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // On first messages load, mark all as "loaded" (no animation)
  useEffect(() => {
    if (isInitialLoad && messages.length > 0) {
      setLoadedMessageIds(new Set(messages.map((m) => m.id)));
      setIsInitialLoad(false);
    }
  }, [messages.length, isInitialLoad, messages]);

  // Detect newly added messages
  useEffect(() => {
    if (!isInitialLoad) {
      const newIds = messages.filter((m) => !loadedMessageIds.has(m.id)).map((m) => m.id);
      if (newIds.length > 0) {
        setLoadedMessageIds((prev) => new Set([...prev, ...newIds]));
      }
    }
  }, [messages, loadedMessageIds, isInitialLoad]);

  // Auto-scroll when new messages are added
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      scrollToBottom();
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length, scrollToBottom]);

  // Auto-scroll during streaming when user hasn't scrolled up
  useEffect(() => {
    if (isScrolledToBottom()) {
      const el = containerRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }
  });

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl py-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => {
            const isLastAssistant = message.role === "assistant" && index === messages.length - 1;
            const isNewMessage = !loadedMessageIds.has(message.id);
            const isUser = message.role === "user";

            return (
              <motion.div
                key={message.id}
                initial={isNewMessage ? { opacity: 0, x: isUser ? 20 : -20 } : false}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <MessageBubble
                  role={message.role}
                  content={message.content}
                  onRegenerate={isLastAssistant ? onRegenerate : undefined}
                  onOpenArtifact={onOpenArtifact}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
        {isStreaming && streamingContent && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex gap-3 px-4 py-3"
          >
            <div className="bg-muted ring-primary/20 flex size-8 shrink-0 items-center justify-center rounded-full ring-1">
              <Bot className="text-muted-foreground size-4" />
            </div>
            <div className="bg-muted text-foreground max-w-[80%] rounded-2xl px-4 py-2.5">
              <StreamingText content={streamingContent} />
            </div>
          </motion.div>
        )}
        {isStreaming && !streamingContent && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex gap-3 px-4 py-3"
          >
            <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-full">
              <Bot className="text-muted-foreground size-4" />
            </div>
            <div className="bg-muted rounded-2xl px-4 py-3">
              <div className="thinking-orb-container">
                <div className="thinking-orb">
                  <div className="thinking-orb-ring-outer" />
                  <div className="thinking-orb-ring" />
                  <div className="thinking-orb-core" />
                </div>
                <span className="thinking-text">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
