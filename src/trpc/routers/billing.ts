import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { createTRPCRouter, orgProcedure } from "../init";

const PLAN_LABELS = {
  free: "Free",
  standard: "Standard",
  pro: "Pro",
} as const;

type PlanKey = keyof typeof PLAN_LABELS;

function isBillingSimulationEnabled() {
  return env.CLERK_BILLING_SIMULATION === "true" || env.CLERK_BILLING_SIMULATION === "1";
}

function normalizePlan(plan: string | undefined): PlanKey | null {
  if (plan === "free" || plan === "standard" || plan === "pro") {
    return plan;
  }

  return null;
}

async function getSimulatedPlan(): Promise<PlanKey> {
  const cookieStore = await cookies();
  const cookiePlan = normalizePlan(cookieStore.get("vm_simulated_plan")?.value);

  return cookiePlan ?? env.CLERK_BILLING_SIMULATED_PLAN;
}

export const billingRouter = createTRPCRouter({
  createCheckout: orgProcedure.mutation(async () => {
    return { checkoutUrl: "/pricing" };
  }),

  createPortalSession: orgProcedure.mutation(async () => {
    return { portalUrl: "/pricing" };
  }),

  getStatus: orgProcedure.query(async ({ ctx }) => {
    if (isBillingSimulationEnabled()) {
      const planKey = await getSimulatedPlan();
      return {
        hasActiveSubscription: planKey !== "free",
        customerId: ctx.orgId,
        estimatedCostCents: 0,
        planKey,
        planLabel: PLAN_LABELS[planKey],
        isSimulated: true,
      };
    }

    const { has } = await auth();
    const hasPro = has({ plan: "pro" });
    const hasStandard = has({ plan: "standard" });
    const planKey: PlanKey = hasPro ? "pro" : hasStandard ? "standard" : "free";

    return {
      hasActiveSubscription: planKey !== "free",
      customerId: ctx.orgId,
      estimatedCostCents: 0,
      planKey,
      planLabel: PLAN_LABELS[planKey],
      isSimulated: false,
    };
  }),
});
