import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { chatterbox } from "@/lib/chatterbox-client";
import { uploadAudio } from "@/lib/r2";
import { authenticateApiRequest } from "@/lib/api-auth";
import { TEXT_MAX_LENGTH } from "@/features/text-to-speech/data/constants";

async function handleMcpRequest(request: Request): Promise<Response> {
  let orgId: string;
  try {
    ({ orgId } = await authenticateApiRequest(request));
  } catch (errorResponse) {
    return errorResponse as Response;
  }

  const server = new McpServer({
    name: "voicemagic",
    version: "1.0.0",
  });

  server.tool(
    "list_voices",
    "List all available voices (system voices and your organization's custom voices)",
    {},
    async () => {
      const voices = await prisma.voice.findMany({
        where: {
          OR: [{ variant: "SYSTEM" }, { variant: "CUSTOM", orgId }],
        },
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          language: true,
          variant: true,
        },
        orderBy: [{ variant: "asc" }, { name: "asc" }],
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ voices }, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "generate_speech",
    "Generate text-to-speech audio from text using a specified voice",
    {
      text: z
        .string()
        .min(1)
        .max(TEXT_MAX_LENGTH)
        .describe("Text to convert to speech"),
      voiceId: z.string().min(1).describe("Voice ID to use for generation"),
      temperature: z
        .number()
        .min(0)
        .max(2)
        .optional()
        .default(0.8)
        .describe("Sampling temperature (0-2)"),
      topP: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .default(0.95)
        .describe("Top-p sampling (0-1)"),
      topK: z
        .number()
        .min(1)
        .max(10000)
        .optional()
        .default(1000)
        .describe("Top-k sampling (1-10000)"),
      repetitionPenalty: z
        .number()
        .min(1)
        .max(2)
        .optional()
        .default(1.2)
        .describe("Repetition penalty (1-2)"),
    },
    async ({ text, voiceId, temperature, topP, topK, repetitionPenalty }) => {
      const voice = await prisma.voice.findUnique({
        where: {
          id: voiceId,
          OR: [{ variant: "SYSTEM" }, { variant: "CUSTOM", orgId }],
        },
        select: { id: true, name: true, r2ObjectKey: true },
      });

      if (!voice) {
        return {
          content: [{ type: "text" as const, text: "Error: Voice not found" }],
          isError: true,
        };
      }

      if (!voice.r2ObjectKey) {
        return {
          content: [
            { type: "text" as const, text: "Error: Voice audio not available" },
          ],
          isError: true,
        };
      }

      const { data, error } = await chatterbox.POST("/generate", {
        body: {
          prompt: text,
          voice_key: voice.r2ObjectKey,
          temperature: temperature ?? 0.8,
          top_p: topP ?? 0.95,
          top_k: topK ?? 1000,
          repetition_penalty: repetitionPenalty ?? 1.2,
          norm_loudness: true,
        },
        parseAs: "arrayBuffer",
      });

      if (error || !(data instanceof ArrayBuffer)) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Error: Failed to generate audio",
            },
          ],
          isError: true,
        };
      }

      const buffer = Buffer.from(data);
      let generationId: string | null = null;

      try {
        const generation = await prisma.generation.create({
          data: {
            orgId,
            text,
            voiceName: voice.name,
            voiceId: voice.id,
            temperature: temperature ?? 0.8,
            topP: topP ?? 0.95,
            topK: topK ?? 1000,
            repetitionPenalty: repetitionPenalty ?? 1.2,
          },
          select: { id: true },
        });

        generationId = generation.id;
        const r2ObjectKey = `generations/orgs/${orgId}/${generation.id}`;
        await uploadAudio({ buffer, key: r2ObjectKey });
        await prisma.generation.update({
          where: { id: generation.id },
          data: { r2ObjectKey },
        });
      } catch {
        if (generationId) {
          await prisma.generation
            .delete({ where: { id: generationId } })
            .catch(() => {});
        }
        return {
          content: [
            {
              type: "text" as const,
              text: "Error: Failed to store generated audio",
            },
          ],
          isError: true,
        };
      }

      const audioUrl = `https://voicemagic.dev/api/v1/audio/${generationId}`;
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ id: generationId, audioUrl }, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "get_generation",
    "Get details and audio URL for a previously generated speech clip",
    {
      generationId: z
        .string()
        .min(1)
        .describe("The generation ID to retrieve"),
    },
    async ({ generationId }) => {
      const generation = await prisma.generation.findUnique({
        where: { id: generationId, orgId },
        omit: { orgId: true, r2ObjectKey: true },
      });

      if (!generation) {
        return {
          content: [
            { type: "text" as const, text: "Error: Generation not found" },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                ...generation,
                audioUrl: `https://voicemagic.dev/api/v1/audio/${generation.id}`,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless mode
  });

  await server.connect(transport);

  return transport.handleRequest(request);
}

export async function POST(request: Request) {
  return handleMcpRequest(request);
}

export async function GET(request: Request) {
  return handleMcpRequest(request);
}

export async function DELETE(request: Request) {
  return handleMcpRequest(request);
}
