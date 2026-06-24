import "server-only";

import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import {
  getPlanCatalogEntry,
  isPlanKey,
  type PlanKey,
} from "./plan-catalog";

function isBillingSimulationEnabled() {
  return env.CLERK_BILLING_SIMULATION === "true" || env.CLERK_BILLING_SIMULATION === "1";
}

async function getSimulatedPlan(): Promise<PlanKey> {
  const cookieStore = await cookies();
  const cookiePlan = cookieStore.get("vm_simulated_plan")?.value;

  return isPlanKey(cookiePlan) ? cookiePlan : env.CLERK_BILLING_SIMULATED_PLAN;
}

export async function getCurrentPlanKey(): Promise<PlanKey> {
  if (isBillingSimulationEnabled()) {
    return getSimulatedPlan();
  }

  const { has } = await auth();
  if (has({ plan: "pro" })) return "pro";
  if (has({ plan: "standard" })) return "standard";
  return "free";
}

export async function getPlanStatus(orgId: string) {
  const planKey = await getCurrentPlanKey();
  const plan = getPlanCatalogEntry(planKey);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [generations, voiceCloneCount] = await Promise.all([
    prisma.generation.findMany({
      where: {
        orgId,
        createdAt: { gte: monthStart },
      },
      select: { text: true },
    }),
    prisma.voice.count({
      where: {
        orgId,
        variant: "CUSTOM",
      },
    }),
  ]);

  const monthlyCreditsUsed = generations.reduce(
    (total, generation) => total + generation.text.length,
    0,
  );

  return {
    hasActiveSubscription: planKey !== "free",
    planKey,
    planLabel: plan.label,
    monthlyCredits: plan.monthlyCredits,
    monthlyCreditsUsed,
    monthlyCreditsRemaining: Math.max(0, plan.monthlyCredits - monthlyCreditsUsed),
    voiceCloneLimit: plan.voiceCloneLimit,
    voiceCloneCount,
    voiceCloneRemaining: Math.max(0, plan.voiceCloneLimit - voiceCloneCount),
    isSimulated: isBillingSimulationEnabled(),
  };
}
