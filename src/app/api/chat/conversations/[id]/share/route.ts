import type { NextRequest } from "next/server";

import { handleApiError } from "@/core/api/errors";
import { getLogger } from "@/core/logging";
import { getConversation } from "@/features/chat";
import { CreateShareSchema, createShare } from "@/features/sharing";

const logger = getLogger("api.chat.share");

/**
 * POST /api/chat/conversations/[id]/share
 * Create a shareable link for a conversation.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { expiresInDays } = CreateShareSchema.parse(body);

    // Verify conversation exists
    await getConversation(id);

    const shared = await createShare(id, expiresInDays);

    const shareUrl = `/shared/${shared.shareToken}`;

    logger.info({ conversationId: id, token: shared.shareToken }, "chat.share_created");

    return Response.json({
      shareToken: shared.shareToken,
      shareUrl,
      expiresAt: shared.expiresAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
