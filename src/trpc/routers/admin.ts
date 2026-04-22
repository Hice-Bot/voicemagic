import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import { polar } from "@/lib/polar";
import { prisma } from "@/lib/db";
import { createTRPCRouter, adminProcedure } from "../init";

const planInputSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  priceMonthly: z.number().int().min(0),
  voiceCloneLimit: z.number().int().min(-1),
  ttsCharLimit: z.number().int().min(-1),
  features: z.array(z.string()),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
});

export const adminRouter = createTRPCRouter({
  getOverview: adminProcedure.query(async () => {
    const clerk = await clerkClient();

    const [totalGenerations, totalVoices, totalApiKeys, generationsPerDay, { totalCount: totalUsers }] =
      await Promise.all([
        prisma.generation.count(),
        prisma.voice.count({ where: { variant: "CUSTOM" } }),
        prisma.apiKey.count(),
        prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
          SELECT DATE_TRUNC('day', "createdAt")::date::text AS date, COUNT(*) AS count
          FROM "Generation"
          WHERE "createdAt" >= NOW() - INTERVAL '30 days'
          GROUP BY 1
          ORDER BY 1 ASC
        `,
        clerk.users.getUserList({ limit: 1 }),
      ]);

    let totalRevenueCents = 0;
    let revenueByMonth: Array<{ month: string; amount: number }> = [];
    let activeSubscriptions = 0;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [ordersRes, subsRes] = await Promise.all([
        polar.orders.list({ limit: 100 }) as Promise<any>,
        polar.subscriptions.list({ limit: 100 }) as Promise<any>,
      ]);

      const orders: Array<{ netAmount?: number; amount?: number; createdAt: string | Date }> =
        ordersRes?.items ?? ordersRes?.result?.items ?? [];
      const subs: Array<{ status: string }> =
        subsRes?.items ?? subsRes?.result?.items ?? [];

      activeSubscriptions = subs.filter((s) => s.status === "active").length;

      const byMonth: Record<string, number> = {};
      for (const order of orders) {
        const amt = order.netAmount ?? order.amount ?? 0;
        totalRevenueCents += amt;
        const month = new Date(order.createdAt).toISOString().slice(0, 7);
        byMonth[month] = (byMonth[month] ?? 0) + amt;
      }
      revenueByMonth = Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, amount]) => ({ month, amount }));
    } catch {
      // Polar not configured or sandbox — return zeros
    }

    return {
      totalUsers,
      totalGenerations,
      totalVoices,
      totalApiKeys,
      totalRevenueCents,
      activeSubscriptions,
      generationsPerDay: generationsPerDay.map((r) => ({
        date: r.date,
        count: Number(r.count),
      })),
      revenueByMonth,
    };
  }),

  getUsers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        query: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const clerk = await clerkClient();
      const { data: users, totalCount } = await clerk.users.getUserList({
        limit: input.limit,
        offset: input.offset,
        query: input.query,
        orderBy: "-created_at",
      });

      const userIds = users.map((u) => u.id);

      const genCounts = await prisma.generation.groupBy({
        by: ["orgId"],
        where: { orgId: { in: userIds } },
        _count: { id: true },
      });

      const countMap = Object.fromEntries(
        genCounts.map((g) => [g.orgId, g._count.id])
      );

      return {
        totalCount,
        users: users.map((u) => ({
          id: u.id,
          name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || "—",
          email: u.emailAddresses[0]?.emailAddress ?? "—",
          imageUrl: u.imageUrl,
          createdAt: new Date(u.createdAt).toISOString(),
          lastSignInAt: u.lastSignInAt ? new Date(u.lastSignInAt).toISOString() : null,
          generationCount: countMap[u.id] ?? 0,
        })),
      };
    }),

  getGenerations: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const items = await prisma.generation.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orgId: true,
          text: true,
          voiceName: true,
          createdAt: true,
        },
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        nextCursor = items.pop()!.id;
      }

      return { items, nextCursor };
    }),

  deleteGeneration: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.generation.delete({ where: { id: input.id } });
      return { success: true };
    }),

  getPlans: adminProcedure.query(async () => {
    return prisma.planConfig.findMany({ orderBy: { sortOrder: "asc" } });
  }),

  upsertPlan: adminProcedure
    .input(planInputSchema.extend({ id: z.string().optional() }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      if (id) {
        return prisma.planConfig.update({ where: { id }, data });
      }
      return prisma.planConfig.create({ data });
    }),

  deletePlan: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.planConfig.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
