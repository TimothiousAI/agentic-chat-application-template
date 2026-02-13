import { handleApiError } from "@/core/api/errors";
import { getLogger } from "@/core/logging";
import { deleteMemoryById } from "@/features/memories";

const logger = getLogger("api.memories.detail");

/**
 * DELETE /api/memories/[id]
 * Delete a memory by ID.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteMemoryById(id);
    logger.info({ memoryId: id }, "memory.delete_completed");
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
