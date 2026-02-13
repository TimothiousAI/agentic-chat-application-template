"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import { useTheme } from "next-themes";
import { toast } from "sonner";

interface ChatActions {
  createNewChat: () => void;
  selectConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

interface CopilotActionsProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  chatActions: ChatActions;
}

export function CopilotActions({
  conversations,
  activeConversationId,
  chatActions,
}: CopilotActionsProps) {
  const { theme, setTheme } = useTheme();

  useCopilotAction({
    name: "createNewChat",
    description:
      "Create a new chat conversation. Use this when the user wants to start fresh or begin a new topic.",
    parameters: [],
    handler: async () => {
      chatActions.createNewChat();
      toast.success("New chat created");
    },
  });

  useCopilotAction({
    name: "switchConversation",
    description:
      "Switch to a specific conversation by ID or title. Use this when the user wants to navigate to a different chat.",
    parameters: [
      {
        name: "identifier",
        type: "string",
        description: "Conversation ID or title to switch to",
        required: true,
      },
    ],
    handler: async ({ identifier }) => {
      let conversation = conversations.find((c) => c.id === identifier);

      if (!conversation) {
        const lowerIdentifier = identifier.toLowerCase();
        conversation = conversations.find((c) => c.title.toLowerCase().includes(lowerIdentifier));
      }

      if (!conversation) {
        toast.error(`Conversation not found: ${identifier}`);
        return;
      }

      chatActions.selectConversation(conversation.id);
      toast.success(`Switched to: ${conversation.title}`);
    },
  });

  useCopilotAction({
    name: "renameConversation",
    description:
      "Rename a conversation. If no ID is provided, renames the currently active conversation.",
    parameters: [
      {
        name: "title",
        type: "string",
        description: "New title for the conversation",
        required: true,
      },
      {
        name: "conversationId",
        type: "string",
        description: "ID of conversation to rename (optional, defaults to active)",
        required: false,
      },
    ],
    handler: async ({ title, conversationId }) => {
      const targetId = conversationId ?? activeConversationId;

      if (!targetId) {
        toast.error("No conversation selected");
        return;
      }

      await chatActions.renameConversation(targetId, title);
      toast.success(`Renamed to: ${title}`);
    },
  });

  useCopilotAction({
    name: "deleteConversation",
    description: "Delete a conversation. Use with caution - this cannot be undone.",
    parameters: [
      {
        name: "identifier",
        type: "string",
        description: "Conversation ID or title to delete",
        required: true,
      },
    ],
    handler: async ({ identifier }) => {
      let conversation = conversations.find((c) => c.id === identifier);

      if (!conversation) {
        const lowerIdentifier = identifier.toLowerCase();
        conversation = conversations.find((c) => c.title.toLowerCase().includes(lowerIdentifier));
      }

      if (!conversation) {
        toast.error(`Conversation not found: ${identifier}`);
        return;
      }

      await chatActions.deleteConversation(conversation.id);
      toast.success("Conversation deleted");
    },
  });

  useCopilotAction({
    name: "toggleTheme",
    description: "Toggle between light and dark mode, or set to a specific theme.",
    parameters: [
      {
        name: "targetTheme",
        type: "string",
        description:
          "Target theme: 'light', 'dark', or 'system' (optional, toggles if not provided)",
        required: false,
      },
    ],
    handler: async ({ targetTheme }) => {
      if (targetTheme) {
        setTheme(targetTheme);
        toast.success(`Theme set to: ${targetTheme}`);
      } else {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        toast.success(`Switched to ${newTheme} mode`);
      }
    },
  });

  useCopilotAction({
    name: "exportConversation",
    description: "Export the current conversation as a markdown file for download.",
    parameters: [
      {
        name: "conversationId",
        type: "string",
        description: "ID of conversation to export (optional, defaults to active)",
        required: false,
      },
    ],
    handler: async ({ conversationId }) => {
      const targetId = conversationId ?? activeConversationId;

      if (!targetId) {
        toast.error("No conversation to export");
        return;
      }

      const conversation = conversations.find((c) => c.id === targetId);
      if (!conversation) {
        toast.error("Conversation not found");
        return;
      }

      try {
        const res = await fetch(`/api/chat/conversations/${targetId}/messages`);
        if (!res.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = (await res.json()) as {
          messages: Array<{ role: string; content: string }>;
        };

        const markdown = [
          `# ${conversation.title}`,
          "",
          `Exported: ${new Date().toLocaleString()}`,
          "",
          "---",
          "",
          ...data.messages.map((m) => `**${m.role}**: ${m.content}\n`),
        ].join("\n");

        const blob = new Blob([markdown], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${conversation.title.replace(/[^a-z0-9]/gi, "-")}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("Conversation exported");
      } catch {
        toast.error("Export failed");
      }
    },
  });

  useCopilotAction({
    name: "searchConversations",
    description:
      "Search for conversations by keyword in their titles. Returns matching conversation titles.",
    parameters: [
      {
        name: "query",
        type: "string",
        description: "Search query to match against conversation titles",
        required: true,
      },
    ],
    handler: async ({ query }) => {
      const lowerQuery = query.toLowerCase();
      const matches = conversations.filter((c) => c.title.toLowerCase().includes(lowerQuery));

      if (matches.length === 0) {
        toast.info(`No conversations found matching: ${query}`);
        return `No conversations found matching "${query}"`;
      }

      const resultText = `Found ${matches.length} conversation(s): ${matches.map((c) => c.title).join(", ")}`;
      toast.success(resultText);
      return resultText;
    },
  });

  return null;
}
