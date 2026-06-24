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

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_DEFAULT_MODEL = "minimax/minimax-m3";

const openRouterResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z
          .object({
            content: z
              .union([
                z.string(),
                z.array(
                  z.object({
                    type: z.string().optional(),
                    text: z.string().optional(),
                  }),
                ),
                z.object({
                  type: z.string().optional(),
                  text: z.string().optional(),
                  content: z.string().optional(),
                }),
              ])
              .nullable()
              .optional(),
          })
          .optional(),
      }),
    )
    .min(1),
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

function resolveOpenRouterModel(configModel: string) {
  const envModel =
    process.env.OPENROUTER_SUPPORT_MODEL?.trim() ||
    process.env.OPENROUTER_MODEL?.trim();

  if (envModel) return envModel;

  // Old saved support settings may still contain Anthropic model IDs.
  return configModel.includes("/") ? configModel : OPENROUTER_DEFAULT_MODEL;
}

function getOpenRouterContent(responseBody: unknown) {
  const parsed = openRouterResponseSchema.safeParse(responseBody);
  if (!parsed.success) return null;

  const content = parsed.data.choices[0]?.message?.content;
  if (typeof content === "string") return content.trim();

  if (Array.isArray(content)) {
    return content
      .map((part) => part.text)
      .filter(Boolean)
      .join("")
      .trim();
  }

  if (content && typeof content === "object") {
    return (content.text ?? content.content ?? "").trim();
  }

  return null;
}

async function createOpenRouterSupportReply({
  apiKey,
  config,
  messages,
}: {
  apiKey: string;
  config: SupportBotConfig;
  messages: z.infer<typeof messageSchema>[];
}) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-Title": "Voicemagic Support",
  };
  const referer = process.env.APP_URL?.trim() || "https://voicemagic.dev";
  if (referer) headers["HTTP-Referer"] = referer;

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: resolveOpenRouterModel(config.model),
      messages: [
        { role: "system", content: config.systemPrompt },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
      max_tokens: 1024,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter support request failed with HTTP ${response.status}`);
  }

  const responseBody: unknown = await response.json();
  const content = getOpenRouterContent(responseBody);
  if (!content) {
    throw new Error("OpenRouter support request returned no message content");
  }

  return content;
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

    const apiKey = options.apiKey ?? process.env.OPENROUTER_API_KEY;
    const lastMessage = messages[messages.length - 1]?.content ?? "";
    if (!apiKey) {
      return new Response(createFallbackSupportReply(lastMessage), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    try {
      const reply = await createOpenRouterSupportReply({ apiKey, config, messages });
      return new Response(reply, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } catch (error) {
      console.error(error);
      return new Response(createFallbackSupportReply(lastMessage), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  };
}
