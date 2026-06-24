import { getPlanStatus } from "@/features/billing/lib/plan-status";
import { createTRPCRouter, orgProcedure } from "../init";

export const billingRouter = createTRPCRouter({
  createCheckout: orgProcedure.mutation(async () => {
    return { checkoutUrl: "/pricing" };
  }),

  createPortalSession: orgProcedure.mutation(async () => {
    return { portalUrl: "/pricing" };
  }),

  getStatus: orgProcedure.query(async ({ ctx }) => {
    return {
      ...(await getPlanStatus(ctx.orgId)),
      customerId: ctx.orgId,
      estimatedCostCents: 0,
    };
  }),
});
