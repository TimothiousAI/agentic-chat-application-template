import { eq } from "drizzle-orm";

import { db } from "@/core/database/client";

import type { NewSharedConversation, SharedConversation } from "./models";
import { sharedConversations } from "./models";

export async function findByToken(token: string): Promise<SharedConversation | undefined> {
  const results = await db
    .select()
    .from(sharedConversations)
    .where(eq(sharedConversations.shareToken, token))
    .limit(1);
  return results[0];
}

export async function findByConversationId(
  conversationId: string,
): Promise<SharedConversation | undefined> {
  const results = await db
    .select()
    .from(sharedConversations)
    .where(eq(sharedConversations.conversationId, conversationId))
    .limit(1);
  return results[0];
}

export async function create(data: NewSharedConversation): Promise<SharedConversation> {
  const results = await db.insert(sharedConversations).values(data).returning();
  const shared = results[0];
  if (!shared) {
    throw new Error("Failed to create shared conversation");
  }
  return shared;
}

export async function deleteByToken(token: string): Promise<boolean> {
  const results = await db
    .delete(sharedConversations)
    .where(eq(sharedConversations.shareToken, token))
    .returning();
  return results.length > 0;
}
