import type { OpenAIAdapterParams } from "@copilotkit/runtime";
import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
  OpenAIAdapter,
} from "@copilotkit/runtime";
import type { NextRequest } from "next/server";
import OpenAI from "openai";

import { env } from "@/core/config/env";
import { getLogger } from "@/core/logging";

const logger = getLogger("copilotkit.runtime");

export async function POST(req: NextRequest) {
  logger.info("copilotkit.request_started");

  try {
    const openai = new OpenAI({
      apiKey: env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });

    // Type assertion needed: top-level openai package has minor type differences
    // from @copilotkit/runtime's bundled openai under exactOptionalPropertyTypes
    const adapter = new OpenAIAdapter({
      openai: openai as unknown as NonNullable<OpenAIAdapterParams["openai"]>,
      model: env.OPENROUTER_MODEL,
    });
    const runtime = new CopilotRuntime();

    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter: adapter,
      endpoint: "/api/copilotkit",
    });

    return handleRequest(req);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({ error: message }, "copilotkit.request_failed");

    return new Response(
      JSON.stringify({
        error: "CopilotKit runtime error",
        message: message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
