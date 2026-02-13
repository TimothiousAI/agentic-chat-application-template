import { getLogger } from "@/core/logging";

import { MemoryNotFoundError } from "./errors";
import { extractMemories } from "./extractor";
import type { Memory } from "./models";
import * as repository from "./repository";

const logger = getLogger("memories.service");

export async function processConversation(conversationText: string): Promise<Memory[]> {
  logger.info({}, "memory.process_started");

  const extracted = await extractMemories(conversationText);
  const savedMemories: Memory[] = [];

  for (const item of extracted) {
    const memory = await repository.createMemory({
      key: item.key,
      value: item.value,
      category: item.category,
    });
    savedMemories.push(memory);
  }

  logger.info({ count: savedMemories.length }, "memory.process_completed");
  return savedMemories;
}

export async function getAllMemories(): Promise<Memory[]> {
  logger.info({}, "memory.get_all_started");
  const mems = await repository.findAllMemories();
  logger.info({ count: mems.length }, "memory.get_all_completed");
  return mems;
}

export async function getMemoriesByCategory(category: string): Promise<Memory[]> {
  logger.info({ category }, "memory.get_by_category_started");
  const mems = await repository.findMemoriesByCategory(category);
  logger.info({ category, count: mems.length }, "memory.get_by_category_completed");
  return mems;
}

export async function deleteMemoryById(id: string): Promise<void> {
  logger.info({ memoryId: id }, "memory.delete_started");

  const deleted = await repository.deleteMemory(id);

  if (!deleted) {
    logger.warn({ memoryId: id }, "memory.delete_failed");
    throw new MemoryNotFoundError(id);
  }

  logger.info({ memoryId: id }, "memory.delete_completed");
}

export function formatMemoriesForPrompt(mems: Memory[]): string {
  if (mems.length === 0) {
    return "";
  }

  const lines = mems.map((m) => `- ${m.key}: ${m.value}`);
  return `User memories and preferences:\n${lines.join("\n")}`;
}
