"use client";

import { useCopilotReadable } from "@copilotkit/react-core";
import type { ReactNode } from "react";

interface ChatState {
  conversations: Array<{
    id: string;
    title: string;
    updatedAt: string;
  }>;
  activeConversationId: string | null;
  messageCount: number;
  isStreaming: boolean;
  streamingContent: string;
}

interface CopilotStateProps {
  chatState: ChatState;
  children: ReactNode;
}

export function CopilotState({ chatState, children }: CopilotStateProps) {
  const { conversations, activeConversationId, messageCount, isStreaming, streamingContent } =
    chatState;

  useCopilotReadable({
    description: "List of all chat conversations with titles and last updated time",
    value: conversations,
  });

  useCopilotReadable({
    description: "ID of the currently active conversation (null if none selected)",
    value: activeConversationId,
  });

  useCopilotReadable({
    description: "Number of messages in the current conversation",
    value: messageCount,
  });

  useCopilotReadable({
    description: "Whether the AI is currently streaming a response",
    value: isStreaming,
  });

  // Always call the hook unconditionally to avoid violating React Rules of Hooks.
  // Pass empty string when not streaming.
  useCopilotReadable({
    description: "Current partial response being streamed from the AI (empty when not streaming)",
    value: isStreaming ? streamingContent : "",
  });

  return <>{children}</>;
}
