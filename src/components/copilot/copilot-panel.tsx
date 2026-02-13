"use client";

import { CopilotPopup } from "@copilotkit/react-ui";

export function CopilotPanel() {
  return (
    <CopilotPopup
      labels={{
        title: "Chat Manager",
        initial:
          "I can help you manage your conversations. Try asking me to create a new chat, switch to a conversation, or find something you talked about earlier.",
      }}
      instructions="You are an AI assistant that helps users manage their chat application. You can create new conversations, switch between existing ones, rename or delete them, toggle the theme, export conversations as markdown, and search through conversation titles. Be helpful, concise, and proactive in suggesting actions based on the user's needs."
    />
  );
}
