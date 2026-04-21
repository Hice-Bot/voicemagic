import { prisma } from "@/lib/db";
import { hashApiKey } from "@/lib/api-keys";

export async function authenticateApiRequest(
  request: Request,
): Promise<{ orgId: string }> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Response(
      JSON.stringify({ error: "Missing or invalid Authorization header" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const key = authHeader.slice("Bearer ".length).trim();

  if (!key) {
    throw new Response(
      JSON.stringify({ error: "Missing API key" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const keyHash = hashApiKey(key);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    select: { id: true, orgId: true },
  });

  if (!apiKey) {
    throw new Response(
      JSON.stringify({ error: "Invalid API key" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  // Update lastUsedAt fire-and-forget
  prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  return { orgId: apiKey.orgId };
}
