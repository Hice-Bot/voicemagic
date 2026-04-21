import { prisma } from "@/lib/db";
import { authenticateApiRequest } from "@/lib/api-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let orgId: string;
  try {
    ({ orgId } = await authenticateApiRequest(request));
  } catch (errorResponse) {
    return errorResponse as Response;
  }

  const { id } = await params;

  const generation = await prisma.generation.findUnique({
    where: { id, orgId },
    omit: { orgId: true, r2ObjectKey: true },
  });

  if (!generation) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({
    id: generation.id,
    text: generation.text,
    voiceName: generation.voiceName,
    voiceId: generation.voiceId,
    temperature: generation.temperature,
    topP: generation.topP,
    topK: generation.topK,
    repetitionPenalty: generation.repetitionPenalty,
    createdAt: generation.createdAt,
    audioUrl: `/api/v1/audio/${generation.id}`,
  });
}
