import { env } from "@/core/config/env";
import { getLogger } from "@/core/logging";

const logger = getLogger("memories.extractor");

export interface ExtractedMemory {
  key: string;
  value: string;
  category: string;
}

const EXTRACTION_PROMPT = `Analyze the following conversation and extract key facts, preferences, and important information worth remembering. Return a JSON array of objects with "key", "value", and "category" fields.

Categories: "preference", "fact", "context", "instruction"

Return ONLY valid JSON, no markdown or explanation. If no memorable information is found, return an empty array [].

Conversation:`;

/**
 * Extract memorable facts from a conversation using a cheap LLM model.
 */
export async function extractMemories(conversationText: string): Promise<ExtractedMemory[]> {
  logger.info({}, "memory.extraction_started");

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "anthropic/claude-haiku-4.5",
        messages: [
          {
            role: "user",
            content: `${EXTRACTION_PROMPT}\n\n${conversationText}`,
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      logger.error({ status: response.status }, "memory.extraction_api_failed");
      return [];
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      logger.warn({}, "memory.extraction_empty_response");
      return [];
    }

    const parsed = JSON.parse(content) as unknown;

    if (!Array.isArray(parsed)) {
      logger.warn({}, "memory.extraction_invalid_format");
      return [];
    }

    const memories: ExtractedMemory[] = [];
    for (const item of parsed) {
      if (
        typeof item === "object" &&
        item !== null &&
        "key" in item &&
        "value" in item &&
        "category" in item &&
        typeof item.key === "string" &&
        typeof item.value === "string" &&
        typeof item.category === "string"
      ) {
        memories.push({
          key: item.key,
          value: item.value,
          category: item.category,
        });
      }
    }

    logger.info({ count: memories.length }, "memory.extraction_completed");
    return memories;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({ error: message }, "memory.extraction_failed");
    return [];
  }
}
