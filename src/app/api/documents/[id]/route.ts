import { handleApiError } from "@/core/api/errors";
import { getLogger } from "@/core/logging";
import { deleteDocument, getDocument } from "@/features/documents";

const logger = getLogger("api.documents.detail");

/**
 * GET /api/documents/[id]
 * Get a single document by ID.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const document = await getDocument(id);
    return Response.json({ document });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/documents/[id]
 * Delete a document by ID.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteDocument(id);
    logger.info({ documentId: id }, "document.delete_completed");
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
