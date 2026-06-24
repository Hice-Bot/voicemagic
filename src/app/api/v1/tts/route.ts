import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getPlanStatus } from "@/features/billing/lib/plan-status";
import { chatterbox } from "@/lib/chatterbox-client";
import { uploadAudio } from "@/lib/r2";
import { authenticateApiRequest } from "@/lib/api-auth";
import { TEXT_MAX_LENGTH } from "@/features/text-to-speech/data/constants";

const bodySchema = z.object({
  text: z.string().min(1).max(TEXT_MAX_LENGTH),
  voiceId: z.string().min(1),
  temperature: z.number().min(0).max(2).optional().default(0.8),
  topP: z.number().min(0).max(1).optional().default(0.95),
  topK: z.number().min(1).max(10000).optional().default(1000),
  repetitionPenalty: z.number().min(1).max(2).optional().default(1.2),
});

export async function POST(request: Request) {
  let orgId: string;
  try {
    ({ orgId } = await authenticateApiRequest(request));
  } catch (errorResponse) {
    return errorResponse as Response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const planStatus = await getPlanStatus(orgId);
  if (planStatus.monthlyCreditsRemaining < input.text.length) {
    return Response.json(
      {
        error: `Monthly credit limit reached for the ${planStatus.planLabel} plan`,
        code: "CREDIT_LIMIT_REACHED",
      },
      { status: 402 },
    );
  }

  const voice = await prisma.voice.findUnique({
    where: {
      id: input.voiceId,
      OR: [
        { variant: "SYSTEM" },
        { variant: "CUSTOM", orgId },
      ],
    },
    select: { id: true, name: true, r2ObjectKey: true },
  });

  if (!voice) {
    return Response.json({ error: "Voice not found" }, { status: 404 });
  }

  if (!voice.r2ObjectKey) {
    return Response.json(
      { error: "Voice audio not available" },
      { status: 409 },
    );
  }

  const { data, error } = await chatterbox.POST("/generate", {
    body: {
      prompt: input.text,
      voice_key: voice.r2ObjectKey,
      temperature: input.temperature,
      top_p: input.topP,
      top_k: input.topK,
      repetition_penalty: input.repetitionPenalty,
      norm_loudness: true,
    },
    parseAs: "arrayBuffer",
  });

  if (error) {
    Sentry.captureException(error, { extra: { orgId, voiceId: input.voiceId } });
    return Response.json({ error: "Failed to generate audio" }, { status: 500 });
  }

  if (!(data instanceof ArrayBuffer)) {
    return Response.json({ error: "Invalid audio response" }, { status: 500 });
  }

  const buffer = Buffer.from(data);
  let generationId: string | null = null;

  try {
    const generation = await prisma.generation.create({
      data: {
        orgId,
        text: input.text,
        voiceName: voice.name,
        voiceId: voice.id,
        temperature: input.temperature,
        topP: input.topP,
        topK: input.topK,
        repetitionPenalty: input.repetitionPenalty,
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
  } catch (err) {
    if (generationId) {
      await prisma.generation
        .delete({ where: { id: generationId } })
        .catch(() => {});
    }
    Sentry.captureException(err, { extra: { orgId } });
    return Response.json(
      { error: "Failed to store generated audio" },
      { status: 500 },
    );
  }

  return Response.json(
    { id: generationId, audioUrl: `/api/v1/audio/${generationId}` },
    { status: 201 },
  );
}
