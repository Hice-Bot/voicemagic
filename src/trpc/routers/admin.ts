import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
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

const DEFAULT_SUPPORT_MODEL = "minimax/minimax-m3";

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

    // Clerk Billing revenue/subscription exports are managed outside this app.
    const totalRevenueCents = 0;
    const revenueByMonth: Array<{ month: string; amount: number }> = [];
    const activeSubscriptions = 0;
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
          name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || "Unknown user",
          email: u.emailAddresses[0]?.emailAddress ?? "No email",
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

      const uniqueUserIds = Array.from(new Set(items.map((i) => i.orgId)));
      const userMap: Record<
        string,
        { name: string; email: string; imageUrl: string }
      > = {};
      if (uniqueUserIds.length > 0) {
        try {
          const clerk = await clerkClient();
          const { data: users } = await clerk.users.getUserList({
            userId: uniqueUserIds,
            limit: uniqueUserIds.length,
          });
          for (const u of users) {
            userMap[u.id] = {
              name:
                [u.firstName, u.lastName].filter(Boolean).join(" ") ||
                u.username ||
                u.emailAddresses[0]?.emailAddress ||
                u.id,
              email: u.emailAddresses[0]?.emailAddress ?? "",
              imageUrl: u.imageUrl,
            };
          }
        } catch {
          // If Clerk lookup fails, fall back to showing IDs
        }
      }

      return {
        items: items.map((i) => ({
          ...i,
          user: userMap[i.orgId] ?? { name: i.orgId, email: "", imageUrl: "" },
        })),
        nextCursor,
      };
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

  getSupportConfig: adminProcedure.query(async () => {
    return prisma.supportConfig.findFirst({ include: { knowledgeBase: { orderBy: { sortOrder: "asc" } } } });
  }),

  upsertSupportConfig: adminProcedure
    .input(
      z.object({
        model: z.string().min(1),
        systemPrompt: z.string().min(1),
        welcomeMessage: z.string().min(1),
        title: z.string().min(1),
        inputPlaceholder: z.string().min(1),
        defaultOpen: z.boolean(),
        accentColor: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await prisma.supportConfig.findFirst();
      if (existing) {
        return prisma.supportConfig.update({ where: { id: existing.id }, data: input });
      }
      return prisma.supportConfig.create({ data: input });
    }),

  addKbDoc: adminProcedure
    .input(z.object({ title: z.string().min(1), content: z.string().min(1) }))
    .mutation(async ({ input }) => {
      let cfg = await prisma.supportConfig.findFirst();
      if (!cfg) {
        cfg = await prisma.supportConfig.create({
          data: { model: DEFAULT_SUPPORT_MODEL },
        });
      }
      const maxOrder = await prisma.supportKnowledgeBase.count({ where: { configId: cfg.id } });
      return prisma.supportKnowledgeBase.create({
        data: { configId: cfg.id, title: input.title, content: input.content, sortOrder: maxOrder },
      });
    }),

  updateKbDoc: adminProcedure
    .input(z.object({ id: z.string(), title: z.string().min(1), content: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return prisma.supportKnowledgeBase.update({ where: { id }, data });
    }),

  deleteKbDoc: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.supportKnowledgeBase.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
