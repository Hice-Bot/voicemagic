import { auth, clerkClient } from "@clerk/nextjs/server";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const { sessionId } = await auth();

  if (sessionId) {
    try {
      const client = await clerkClient();
      await client.sessions.revokeSession(sessionId);
    } catch (err) {
      console.error("[sign-out] revokeSession failed", err);
    }
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const base = process.env.APP_URL ?? (host ? `${proto}://${host}` : "");
  const res = NextResponse.redirect(`${base}/sign-in`, 303);

  const cookieStore = await cookies();
  for (const c of cookieStore.getAll()) {
    if (c.name.startsWith("__session") || c.name.startsWith("__client") || c.name.startsWith("__clerk")) {
      res.cookies.set(c.name, "", { path: "/", maxAge: 0 });
    }
  }

  return res;
}

export const POST = GET;
