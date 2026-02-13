import { cosineDistance, desc, eq, sql } from "drizzle-orm";

import { db } from "@/core/database/client";

import type { Document, DocumentChunk, NewDocument, NewDocumentChunk } from "./models";
import { documentChunks, documents } from "./models";

export async function findById(id: string): Promise<Document | undefined> {
  const results = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  return results[0];
}

export async function findAll(): Promise<Document[]> {
  return db.select().from(documents).orderBy(desc(documents.createdAt));
}

export async function create(data: NewDocument): Promise<Document> {
  const results = await db.insert(documents).values(data).returning();
  const doc = results[0];
  if (!doc) {
    throw new Error("Failed to create document");
  }
  return doc;
}

export async function deleteById(id: string): Promise<boolean> {
  const results = await db.delete(documents).where(eq(documents.id, id)).returning();
  return results.length > 0;
}

export async function createChunks(chunks: NewDocumentChunk[]): Promise<DocumentChunk[]> {
  if (chunks.length === 0) {
    return [];
  }
  return db.insert(documentChunks).values(chunks).returning();
}

export async function searchSimilarChunks(
  queryEmbedding: number[],
  limit = 5,
): Promise<Array<DocumentChunk & { similarity: number }>> {
  const similarity = sql<number>`1 - ${cosineDistance(documentChunks.embedding, queryEmbedding)}`;

  const results = await db
    .select({
      id: documentChunks.id,
      documentId: documentChunks.documentId,
      content: documentChunks.content,
      chunkIndex: documentChunks.chunkIndex,
      embedding: documentChunks.embedding,
      tokenCount: documentChunks.tokenCount,
      createdAt: documentChunks.createdAt,
      updatedAt: documentChunks.updatedAt,
      similarity,
    })
    .from(documentChunks)
    .orderBy(desc(similarity))
    .limit(limit);

  return results.map((r) => ({
    id: r.id,
    documentId: r.documentId,
    content: r.content,
    chunkIndex: r.chunkIndex,
    embedding: r.embedding,
    tokenCount: r.tokenCount,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    similarity: Number(r.similarity),
  }));
}
