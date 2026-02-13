import type { NextRequest } from "next/server";

import { handleApiError } from "@/core/api/errors";
import { getLogger } from "@/core/logging";
import { listDocuments, UploadDocumentSchema, uploadDocument } from "@/features/documents";

const logger = getLogger("api.documents");

/**
 * GET /api/documents
 * List all uploaded documents.
 */
export async function GET() {
  try {
    const documents = await listDocuments();
    return Response.json({ documents });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/documents
 * Upload a new document for RAG.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, content } = UploadDocumentSchema.parse(body);

    logger.info({ name }, "document.upload_started");

    const document = await uploadDocument(name, content);

    logger.info({ documentId: document.id }, "document.upload_completed");

    return Response.json({ document }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
