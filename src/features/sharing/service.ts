import { nanoid } from "nanoid";

import { getLogger } from "@/core/logging";

import { ShareTokenExpiredError, ShareTokenNotFoundError } from "./errors";
import type { SharedConversation } from "./models";
import * as repository from "./repository";

const logger = getLogger("sharing.service");

export async function createShare(
  conversationId: string,
  expiresInDays?: number,
): Promise<SharedConversation> {
  logger.info({ conversationId }, "share.create_started");

  const token = nanoid(21);
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const shared = await repository.create({
    conversationId,
    shareToken: token,
    expiresAt,
  });

  logger.info({ conversationId, token }, "share.create_completed");
  return shared;
}

export async function getSharedConversation(token: string): Promise<SharedConversation> {
  logger.info({ token }, "share.get_started");

  const shared = await repository.findByToken(token);

  if (!shared) {
    logger.warn({ token }, "share.get_failed");
    throw new ShareTokenNotFoundError(token);
  }

  if (shared.expiresAt && new Date(shared.expiresAt) < new Date()) {
    logger.warn({ token }, "share.expired");
    throw new ShareTokenExpiredError(token);
  }

  logger.info({ token }, "share.get_completed");
  return shared;
}

export async function deleteShare(token: string): Promise<void> {
  logger.info({ token }, "share.delete_started");

  const deleted = await repository.deleteByToken(token);

  if (!deleted) {
    logger.warn({ token }, "share.delete_failed");
    throw new ShareTokenNotFoundError(token);
  }

  logger.info({ token }, "share.delete_completed");
}
