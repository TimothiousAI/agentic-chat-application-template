"use client";

import { useCallback, useRef, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useArtifacts } from "@/hooks/use-artifacts";
import { useChat } from "@/hooks/use-chat";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

import { CopilotActions } from "../copilot/copilot-actions";
import { CopilotPanel } from "../copilot/copilot-panel";
import { CopilotState } from "../copilot/copilot-state";
import { ArtifactsPanel } from "./artifacts-panel";
import { ChatHeader } from "./chat-header";
import type { ChatInputRef } from "./chat-input";
import { ChatInput } from "./chat-input";
import { ChatSidebar } from "./chat-sidebar";
import { ConversationStarters } from "./conversation-starters";
import { KeyboardShortcutsDialog } from "./keyboard-shortcuts-dialog";
import { MessageList } from "./message-list";

export function ChatLayout() {
  const {
    conversations,
    activeConversationId,
    messages,
    isStreaming,
    isLoadingMessages,
    streamingContent,
    sendMessage,
    selectConversation,
    createNewChat,
    renameConversation,
    deleteConversation,
    stopStreaming,
    regenerateLastMessage,
  } = useChat();

  const {
    artifacts,
    activeArtifactId,
    isPanelOpen,
    addArtifact,
    setActiveArtifact,
    closePanel,
    clearArtifacts,
  } = useArtifacts();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [activePersonaSlug, setActivePersonaSlug] = useState("general-assistant");
  const inputRef = useRef<ChatInputRef>(null);

  const activeTitle = conversations.find((c) => c.id === activeConversationId)?.title ?? null;

  const toggleSidebar = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleCreateNewChat = useCallback(() => {
    createNewChat();
    clearArtifacts();
  }, [createNewChat, clearArtifacts]);

  const handleOpenArtifact = useCallback(
    (artifact: { type: "code" | "text"; language?: string | undefined; content: string }) => {
      const id = `artifact-${Date.now()}`;
      addArtifact({ id, ...artifact });
    },
    [addArtifact],
  );

  useKeyboardShortcuts({
    onNewChat: handleCreateNewChat,
    onStopStreaming: stopStreaming,
    onFocusInput: focusInput,
    onShowHelp: () => setShowShortcuts(true),
    isStreaming,
  });

  const chatState = {
    conversations,
    activeConversationId,
    messageCount: messages.length,
    isStreaming,
    streamingContent,
  };

  const chatActions = {
    createNewChat: handleCreateNewChat,
    selectConversation,
    renameConversation,
    deleteConversation,
  };

  const hasMessages = messages.length > 0 || isStreaming;

  return (
    <CopilotState chatState={chatState}>
      <CopilotActions
        conversations={conversations}
        activeConversationId={activeConversationId}
        chatActions={chatActions}
      />
      <CopilotPanel />

      <div className="flex h-screen">
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={selectConversation}
          onNewChat={handleCreateNewChat}
          onRenameConversation={renameConversation}
          onDeleteConversation={deleteConversation}
          isMobileOpen={isMobileOpen}
          onMobileClose={closeMobile}
        />

        <div className="flex flex-1 overflow-hidden">
          <div className="chat-gradient-bg flex flex-1 flex-col">
            <ChatHeader
              title={activeTitle}
              onToggleSidebar={toggleSidebar}
              activeConversationId={activeConversationId}
              selectedPersonaSlug={activePersonaSlug}
              onSelectPersona={setActivePersonaSlug}
            />

            {isLoadingMessages && activeConversationId ? (
              <div className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-3xl space-y-4 py-4">
                  <div className="flex gap-3 px-4 py-3">
                    <Skeleton className="size-8 shrink-0 rounded-full" />
                    <Skeleton className="h-16 w-3/4 rounded-2xl" />
                  </div>
                  <div className="flex flex-row-reverse gap-3 px-4 py-3">
                    <Skeleton className="h-10 w-1/2 rounded-2xl" />
                  </div>
                  <div className="flex gap-3 px-4 py-3">
                    <Skeleton className="size-8 shrink-0 rounded-full" />
                    <Skeleton className="h-24 w-2/3 rounded-2xl" />
                  </div>
                  <div className="flex flex-row-reverse gap-3 px-4 py-3">
                    <Skeleton className="h-10 w-2/5 rounded-2xl" />
                  </div>
                </div>
              </div>
            ) : !hasMessages && !activeConversationId ? (
              <ConversationStarters onSelect={sendMessage} />
            ) : hasMessages ? (
              <MessageList
                messages={messages}
                streamingContent={streamingContent}
                isStreaming={isStreaming}
                onRegenerate={regenerateLastMessage}
                onOpenArtifact={handleOpenArtifact}
              />
            ) : null}

            <ChatInput
              ref={inputRef}
              onSend={sendMessage}
              disabled={isStreaming}
              isStreaming={isStreaming}
              onStop={stopStreaming}
            />
          </div>

          <ArtifactsPanel
            artifacts={artifacts}
            activeArtifactId={activeArtifactId}
            onSetActive={setActiveArtifact}
            onClose={closePanel}
            isOpen={isPanelOpen}
          />
        </div>
      </div>

      <KeyboardShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />
    </CopilotState>
  );
}
