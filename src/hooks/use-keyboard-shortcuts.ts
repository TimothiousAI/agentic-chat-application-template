"use client";

import { useCallback, useEffect } from "react";

interface UseKeyboardShortcutsOptions {
  onNewChat: () => void;
  onStopStreaming: () => void;
  onFocusInput: () => void;
  onShowHelp: () => void;
  isStreaming?: boolean;
}

export function useKeyboardShortcuts({
  onNewChat,
  onStopStreaming,
  onFocusInput,
  onShowHelp,
  isStreaming = false,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      // Escape works even in input fields
      if (event.key === "Escape" && isStreaming) {
        event.preventDefault();
        onStopStreaming();
        return;
      }

      // Help dialog (Cmd/Ctrl + /) - check BEFORE "/" alone
      if (event.key === "/" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onShowHelp();
        return;
      }

      // "/" focuses input from anywhere (but not in input fields)
      if (event.key === "/" && !isInputField) {
        event.preventDefault();
        onFocusInput();
        return;
      }

      // New chat (Cmd/Ctrl + K) - not in input fields
      if (event.key === "k" && (event.metaKey || event.ctrlKey) && !isInputField) {
        event.preventDefault();
        onNewChat();
        return;
      }
    },
    [isStreaming, onStopStreaming, onFocusInput, onShowHelp, onNewChat],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export const SHORTCUTS: Array<{
  keys: string;
  description: string;
  condition?: string;
}> = [
  { keys: "⌘ K / Ctrl K", description: "Create new chat" },
  { keys: "Escape", description: "Stop generating", condition: "When streaming" },
  { keys: "/", description: "Focus chat input" },
  { keys: "⌘ / / Ctrl /", description: "Show keyboard shortcuts" },
  { keys: "Enter", description: "Send message", condition: "In chat input" },
  { keys: "Shift Enter", description: "New line", condition: "In chat input" },
];
