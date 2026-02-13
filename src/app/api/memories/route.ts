import { handleApiError } from "@/core/api/errors";
import { getLogger } from "@/core/logging";
import { getAllMemories } from "@/features/memories";

const logger = getLogger("api.memories");

/**
 * GET /api/memories
 * List all stored memories.
 */
export async function GET() {
  try {
    logger.info({}, "memories.list_started");
    const memories = await getAllMemories();
    logger.info({ count: memories.length }, "memories.list_completed");
    return Response.json({ memories });
  } catch (error) {
    return handleApiError(error);
  }
}
