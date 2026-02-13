import { notFound } from "next/navigation";

import { getConversation, getMessages } from "@/features/chat";
import { getSharedConversation } from "@/features/sharing";

import { SharedConversationView } from "./shared-conversation-view";

interface SharedPageProps {
  params: Promise<{ token: string }>;
}

export default async function SharedConversationPage({ params }: SharedPageProps) {
  const { token } = await params;

  let conversationId: string;
  try {
    const shared = await getSharedConversation(token);
    conversationId = shared.conversationId;
  } catch {
    notFound();
  }

  let title: string;
  let messages: Array<{ role: string; content: string }>;
  try {
    const conversation = await getConversation(conversationId);
    const rawMessages = await getMessages(conversationId);
    title = conversation.title;
    messages = rawMessages.map((m) => ({ role: m.role, content: m.content }));
  } catch {
    notFound();
  }

  return <SharedConversationView title={title} messages={messages} />;
}
