import { prisma } from "@/lib/db";
import { getSignedAudioUrl } from "@/lib/r2";
import { authenticateApiRequest } from "@/lib/api-auth";

// Public demo generation IDs used on the landing page voice showcase
const DEMO_IDS = new Set([
  "cmo83lrdt000001s543t3fgxd",
  "cmo83m4je000401s53fx160f0",
  "cmo83lxfw000201s5txr94h2r",
  "cmo83m1at000301s5j9p3mfa6",
  "cmo83luiu000101s5gcerml0d",
]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let orgId: string | undefined;
  if (!DEMO_IDS.has(id)) {
    try {
      ({ orgId } = await authenticateApiRequest(request));
    } catch (errorResponse) {
      return errorResponse as Response;
    }
  }

  const generation = await prisma.generation.findUnique({
    where: orgId ? { id, orgId } : { id },
  });

  if (!generation) {
    return new Response("Not found", { status: 404 });
  }

  if (!generation.r2ObjectKey) {
    return new Response("Audio is not available yet", { status: 409 });
  }

  const signedUrl = await getSignedAudioUrl(generation.r2ObjectKey);
  const audioResponse = await fetch(signedUrl);

  if (!audioResponse.ok) {
    return new Response("Failed to fetch audio", { status: 502 });
  }

  return new Response(audioResponse.body, {
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
