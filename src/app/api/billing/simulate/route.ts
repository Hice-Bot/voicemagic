import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const PLAN_KEYS = new Set(["free", "standard", "pro"]);

function isBillingSimulationEnabled() {
  return process.env.CLERK_BILLING_SIMULATION === "true" || process.env.CLERK_BILLING_SIMULATION === "1";
}

function getPublicUrl(request: Request, path: string) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const proto = forwardedProto ?? "https";

  if (host) {
    return new URL(path, `${proto}://${host}`);
  }

  return new URL(path, request.url);
}

export async function POST(request: Request) {
  if (!isBillingSimulationEnabled()) {
    return Response.json({ error: "Billing simulation is disabled" }, { status: 404 });
  }

  const formData = await request.formData();
  const plan = formData.get("plan");

  if (typeof plan !== "string" || !PLAN_KEYS.has(plan)) {
    return Response.json({ error: "Invalid simulated plan" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set("vm_simulated_plan", plan, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  const { userId } = await auth();
  return NextResponse.redirect(getPublicUrl(request, userId ? "/text-to-speech" : "/sign-up"), 303);
}
