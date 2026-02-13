import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { chatSharedConversations as sharedConversations } from "@/core/database/schema";

export { sharedConversations };

export type SharedConversation = InferSelectModel<typeof sharedConversations>;
export type NewSharedConversation = InferInsertModel<typeof sharedConversations>;
