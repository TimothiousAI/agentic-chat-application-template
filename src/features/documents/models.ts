import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import {
  chatDocumentChunks as documentChunks,
  chatDocuments as documents,
} from "@/core/database/schema";

export { documents, documentChunks };

export type Document = InferSelectModel<typeof documents>;
export type NewDocument = InferInsertModel<typeof documents>;
export type DocumentChunk = InferSelectModel<typeof documentChunks>;
export type NewDocumentChunk = InferInsertModel<typeof documentChunks>;
