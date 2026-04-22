import * as Sentry from "@sentry/node";
import { auth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import superjson from "superjson";
export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return {};
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

const sentryMiddleware = t.middleware(
  Sentry.trpcMiddleware({
    attachRpcInput: true,
  }),
);

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure.use(sentryMiddleware);

// Authenticated procedure - calls auth() only when needed
export const authProcedure = baseProcedure.use(async ({ next }) => {
  const { userId } = await auth();

  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: { userId },
  });
});

// Admin-only procedure — userId must be in ADMIN_USER_IDS env var
export const adminProcedure = baseProcedure.use(async ({ next }) => {
  const { userId } = await auth();
  if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").filter(Boolean);
  if (!adminIds.includes(userId)) throw new TRPCError({ code: "FORBIDDEN" });

  return next({ ctx: { userId } });
});

// Individual-user procedure. orgId is aliased to userId so existing
// call sites that reference ctx.orgId continue to work without changes —
// each user is effectively their own org for data-scoping purposes.
export const orgProcedure = baseProcedure.use(async ({ next }) => {
  const { userId } = await auth();

  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({ ctx: { userId, orgId: userId } });
});
