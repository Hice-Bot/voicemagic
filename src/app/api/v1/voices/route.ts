import { prisma } from "@/lib/db";
import { authenticateApiRequest } from "@/lib/api-auth";
import { normalizeVoiceList, sortVoiceDisplayList } from "@/features/voices/lib/voice-display";

export async function GET(request: Request) {
  let orgId: string;
  try {
    ({ orgId } = await authenticateApiRequest(request));
  } catch (errorResponse) {
    return errorResponse as Response;
  }

  const voices = await prisma.voice.findMany({
    where: {
      OR: [{ variant: "SYSTEM" }, { variant: "CUSTOM", orgId }],
    },
    select: {
      id: true,
      name: true,
      description: true,
      categories: {
        select: { category: true },
        take: 1,
      },
      language: true,
      variant: true,
    },
    orderBy: [{ variant: "asc" }, { name: "asc" }],
  });

  return Response.json({
    voices: sortVoiceDisplayList(normalizeVoiceList(voices.map(({ categories, ...voice }) => ({
      ...voice,
      category: categories[0]?.category ?? "GENERAL",
    })))),
  });
}
