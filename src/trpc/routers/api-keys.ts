import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/db";
import { generateApiKey } from "@/lib/api-keys";
import { createTRPCRouter, orgProcedure } from "../init";

export const apiKeysRouter = createTRPCRouter({
  create: orgProcedure
    .input(z.object({ name: z.string().min(1).max(100) }))
    .mutation(async ({ input, ctx }) => {
      const { key, keyHash, keyPrefix } = generateApiKey();

      await prisma.apiKey.create({
        data: {
          orgId: ctx.orgId,
          name: input.name,
          keyHash,
          keyPrefix,
        },
      });

      // Return full key ONCE — never stored in plaintext
      return { key, keyPrefix, name: input.name };
    }),

  getAll: orgProcedure.query(async ({ ctx }) => {
    const keys = await prisma.apiKey.findMany({
      where: { orgId: ctx.orgId },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return keys;
  }),

  revoke: orgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const key = await prisma.apiKey.findUnique({
        where: { id: input.id },
        select: { orgId: true },
      });

      if (!key || key.orgId !== ctx.orgId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await prisma.apiKey.delete({ where: { id: input.id } });

      return { success: true };
    }),
});
