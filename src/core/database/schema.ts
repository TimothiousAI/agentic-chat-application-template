import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

/**
 * Table name prefix for multi-tenant workshop environments.
 * Set TABLE_PREFIX=yourname in .env to prefix all app tables (e.g., yourname_projects).
 * The users table is always shared (unprefixed) since it syncs from Supabase Auth.
 * If TABLE_PREFIX is not set, no prefix is applied.
 */
const tablePrefix = process.env["TABLE_PREFIX"] ? `${process.env["TABLE_PREFIX"]}_` : "";
export const t = (name: string) => `${tablePrefix}${name}`;

/**
 * Base timestamp columns for all tables.
 * Usage: ...timestamps
 */
export const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
};

/**
 * Users table - syncs with Supabase Auth via database trigger.
 *
 * To set up the trigger in Supabase SQL Editor:
 *
 * ```sql
 * -- Function to sync auth.users to public.users
 * CREATE OR REPLACE FUNCTION public.handle_new_user()
 * RETURNS trigger AS $$
 * BEGIN
 *   INSERT INTO public.users (id, email)
 *   VALUES (NEW.id, NEW.email);
 *   RETURN NEW;
 * END;
 * $$ LANGUAGE plpgsql SECURITY DEFINER;
 *
 * -- Trigger on auth.users insert
 * CREATE OR REPLACE TRIGGER on_auth_user_created
 *   AFTER INSERT ON auth.users
 *   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
 * ```
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // References auth.users(id)
  email: text("email").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  ...timestamps,
});

/**
 * Projects table - stores project information with ownership.
 */
export const projects = pgTable(t("projects"), {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  isPublic: boolean("is_public").notNull().default(false),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ...timestamps,
});

/**
 * Conversations table - stores chat conversations.
 * No owner since auth is not required.
 */
export const chatConversations = pgTable(t("chat_conversations"), {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  ...timestamps,
});

/**
 * Messages table - stores individual chat messages within conversations.
 */
export const chatMessages = pgTable(t("chat_messages"), {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => chatConversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  ...timestamps,
});

/**
 * Shared conversations table - enables sharing conversations via unique tokens.
 */
export const chatSharedConversations = pgTable(t("chat_shared_conversations"), {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => chatConversations.id, { onDelete: "cascade" }),
  shareToken: text("share_token").notNull().unique(),
  expiresAt: timestamp("expires_at"),
  ...timestamps,
});

/**
 * Documents table - stores uploaded document metadata and content.
 */
export const chatDocuments = pgTable(t("chat_documents"), {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  content: text("content").notNull(),
  ...timestamps,
});

/**
 * Document chunks table - stores chunked document content with vector embeddings.
 * Requires the pgvector extension to be enabled in the database.
 */
export const chatDocumentChunks = pgTable(
  t("chat_document_chunks"),
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => chatDocuments.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 384 }),
    tokenCount: integer("token_count").notNull(),
    ...timestamps,
  },
  (table) => [
    index("chat_document_chunks_embedding_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
  ],
);

/**
 * Memories table - stores key-value memories optionally linked to conversations.
 */
export const chatMemories = pgTable(t("chat_memories"), {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  category: text("category"),
  conversationId: uuid("conversation_id").references(() => chatConversations.id, {
    onDelete: "cascade",
  }),
  ...timestamps,
});
