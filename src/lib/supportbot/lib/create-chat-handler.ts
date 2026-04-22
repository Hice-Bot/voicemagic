import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { z } from "zod";
import type { ChatApiHandlerOptions, SupportBotConfig } from "../types";
import { DEFAULT_CONFIG } from "../types";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1),
  config: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Creates a Next.js App Router POST handler for the support chat API.
 *
 * Usage in app/api/support-chat/route.ts:
 *   import { createChatHandler } from "@hice/supportbot/api";
 *   export const POST = createChatHandler({ getConfig: () => myDb.getSupportConfig() });
 */
export function createChatHandler(options: ChatApiHandlerOptions) {
  return async function POST(request: Request): Promise<Response> {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response("Invalid request body", { status: 400 });
    }

    const { messages } = parsed.data;

    const savedConfig = await options.getConfig();
    const config: SupportBotConfig = { ...DEFAULT_CONFIG, ...savedConfig };

    const apiKey = options.apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response("ANTHROPIC_API_KEY not configured", { status: 500 });
    }

    const anthropic = createAnthropic({ apiKey });

    const result = streamText({
      model: anthropic(config.model),
      system: config.systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      maxOutputTokens: 1024,
    });

    return result.toTextStreamResponse();
  };
}
