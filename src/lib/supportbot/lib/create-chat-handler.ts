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

function createFallbackSupportReply(message: string) {
  const lower = message.toLowerCase();

  if (/(price|pricing|plan|credit|limit|billing|payment)/.test(lower)) {
    return [
      "Voicemagic uses one shared monthly credit pool for web generations, API calls, and MCP agent usage.",
      "Free includes 10k credits and 1 custom voice. Standard includes 250k credits and 10 custom voices. Pro includes 1M credits and 50 custom voices.",
      "While the site is listed for sale, plan selection is simulated so buyers can test onboarding and plan behavior without processing a live payment.",
    ].join(" ");
  }

  if (/(api|mcp|key|agent|connect)/.test(lower)) {
    return [
      "Use the API/MCP page in the logged-in dashboard to connect Voicemagic to apps and agents.",
      "Create an API key from the API key settings, then pass it in the Authorization header for REST or MCP requests.",
      "API, MCP, and web usage all draw from the same plan credits.",
    ].join(" ");
  }

  if (/(clone|voice|voices|library|audio|speech|tts)/.test(lower)) {
    return [
      "Voicemagic can generate speech from built-in voices or private custom voices.",
      "Custom voice limits depend on the selected plan: Free allows 1, Standard allows 10, and Pro allows 50.",
      "For best cloning results, upload or record at least 10 seconds of clear source audio.",
    ].join(" ");
  }

  if (/(contact|human|support|sale|flippa|buyer)/.test(lower)) {
    return "For support, sale, billing, or handoff questions that need a person, use the Contact page or email jeff@jeffhampton.us.";
  }

  return [
    "Voicemagic is an AI voice platform for text-to-speech, custom voice cloning, built-in voices, REST API access, and MCP-compatible agent workflows.",
    "You can ask me about plans, credits, voice cloning, API/MCP setup, or how simulated plan selection works while the site is for sale.",
  ].join(" ");
}

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
      const lastMessage = messages[messages.length - 1]?.content ?? "";
      return new Response(createFallbackSupportReply(lastMessage), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
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
