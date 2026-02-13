import { getLogger } from "@/core/logging";

import { chunkText } from "./chunker";
import { generateEmbedding, generateEmbeddings } from "./embeddings";
import { DocumentNotFoundError, DocumentUploadFailedError } from "./errors";
import type { Document } from "./models";
import * as repository from "./repository";

const logger = getLogger("documents.service");

export async function uploadDocument(name: string, content: string): Promise<Document> {
  logger.info({ name }, "document.upload_started");

  const chunks = chunkText(content);
  if (chunks.length === 0) {
    throw new DocumentUploadFailedError("Document content produced no chunks");
  }

  const document = await repository.create({
    title: name,
    filename: name,
    mimeType: "text/plain",
    size: content.length,
    content,
  });

  const chunkTexts = chunks.map((c) => c.content);
  const embeddings = await generateEmbeddings(chunkTexts);

  const chunkData = chunks.map((chunk, i) => ({
    documentId: document.id,
    content: chunk.content,
    chunkIndex: chunk.index,
    embedding: embeddings[i] ?? [],
    tokenCount: Math.ceil(chunk.content.length / 4),
  }));

  await repository.createChunks(chunkData);

  logger.info({ documentId: document.id, chunkCount: chunks.length }, "document.upload_completed");
  return document;
}

export async function getDocument(id: string): Promise<Document> {
  logger.info({ documentId: id }, "document.get_started");

  const document = await repository.findById(id);

  if (!document) {
    logger.warn({ documentId: id }, "document.get_failed");
    throw new DocumentNotFoundError(id);
  }

  logger.info({ documentId: id }, "document.get_completed");
  return document;
}

export async function listDocuments(): Promise<Document[]> {
  logger.info({}, "document.list_started");
  const docs = await repository.findAll();
  logger.info({ count: docs.length }, "document.list_completed");
  return docs;
}

export async function deleteDocument(id: string): Promise<void> {
  logger.info({ documentId: id }, "document.delete_started");

  const deleted = await repository.deleteById(id);

  if (!deleted) {
    logger.warn({ documentId: id }, "document.delete_failed");
    throw new DocumentNotFoundError(id);
  }

  logger.info({ documentId: id }, "document.delete_completed");
}

export async function searchRelevantContext(query: string, limit = 5): Promise<string> {
  logger.info({ query: query.substring(0, 100) }, "document.search_started");

  const queryEmbedding = await generateEmbedding(query);
  const results = await repository.searchSimilarChunks(queryEmbedding, limit);

  if (results.length === 0) {
    logger.info({}, "document.search_no_results");
    return "";
  }

  const context = results.map((r) => r.content).join("\n\n---\n\n");

  logger.info({ resultCount: results.length }, "document.search_completed");
  return context;
}
