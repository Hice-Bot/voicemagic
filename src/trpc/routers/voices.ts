import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/db";
import { deleteAudio } from "@/lib/r2";
import { createTRPCRouter, orgProcedure } from "../init";
import type { Prisma, VoiceCategory, VoiceVariant } from "@/generated/prisma/client";

const VOICE_CATEGORY_VALUES = [
  "AUDIOBOOK", "CONVERSATIONAL", "CUSTOMER_SERVICE", "GENERAL", "NARRATIVE",
  "CHARACTERS", "MEDITATION", "MOTIVATIONAL", "PODCAST", "ADVERTISING",
  "VOICEOVER", "CORPORATE",
] as const satisfies readonly VoiceCategory[];

const VOICE_VARIANT_VALUES = ["SYSTEM", "CUSTOM"] as const satisfies readonly VoiceVariant[];
const VOICE_VIEW_VALUES = ["all", "favorites", "cloned"] as const;

export const voicesRouter = createTRPCRouter({
  getAll: orgProcedure
    .input(
      z
        .object({
          query: z.string().trim().optional(),
          view: z.enum(VOICE_VIEW_VALUES).optional(),
          category: z.enum(VOICE_CATEGORY_VALUES).optional(),
          language: z.string().optional(),
          variant: z.enum(VOICE_VARIANT_VALUES).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.VoiceWhereInput = {
        OR: [
          { variant: "SYSTEM" },
          { variant: "CUSTOM", orgId: ctx.orgId },
        ],
      };

      if (input?.query) {
        where.AND = [{
          OR: [
            { name: { contains: input.query, mode: "insensitive" } },
            { description: { contains: input.query, mode: "insensitive" } },
          ],
        }];
      }

      if (input?.category) {
        where.categories = { some: { category: input.category } };
      }
      if (input?.language) where.language = input.language;
      if (input?.variant) where.variant = input.variant;

      if (input?.view === "cloned") where.variant = "CUSTOM";
      if (input?.view === "favorites") {
        where.favorites = { some: { userId: ctx.userId } };
      }

      const [rows, favoriteRows] = await Promise.all([
        prisma.voice.findMany({
          where,
          orderBy: [
            { variant: "desc" }, // CUSTOM first
            { name: "asc" },
          ],
          select: {
            id: true,
            name: true,
            description: true,
            categories: {
              select: { category: true },
            },
            language: true,
            variant: true,
            createdAt: true,
          },
        }),
        prisma.voiceFavorite.findMany({
          where: { userId: ctx.userId },
          select: { voiceId: true },
        }),
      ]);

      const favoriteIds = new Set(favoriteRows.map((f) => f.voiceId));
      const voices = rows.map(({ categories, ...v }) => ({
        ...v,
        category: categories[0]?.category ?? "GENERAL",
        isFavorite: favoriteIds.has(v.id),
      }));

      // Sort: favorites first, then by variant/name (preserving findMany order otherwise)
      voices.sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
        return 0;
      });

      // Facet counts for filter sidebar (pre-narrow, only view + text query applied)
      const facetWhere: Prisma.VoiceWhereInput = {
        OR: [
          { variant: "SYSTEM" },
          { variant: "CUSTOM", orgId: ctx.orgId },
        ],
      };
      if (input?.query) {
        facetWhere.AND = [{
          OR: [
            { name: { contains: input.query, mode: "insensitive" } },
            { description: { contains: input.query, mode: "insensitive" } },
          ],
        }];
      }
      if (input?.view === "cloned") facetWhere.variant = "CUSTOM";
      if (input?.view === "favorites") {
        facetWhere.favorites = { some: { userId: ctx.userId } };
      }

      const [categoryFacets, languageFacets] = await Promise.all([
        prisma.voiceCategoryAssignment.groupBy({
          by: ["category"],
          where: { voice: facetWhere },
          _count: { _all: true },
        }),
        prisma.voice.groupBy({
          by: ["language"],
          where: facetWhere,
          _count: { _all: true },
        }),
      ]);

      return {
        voices,
        counts: {
          total: voices.length,
          favorites: favoriteIds.size,
          cloned: voices.filter((v) => v.variant === "CUSTOM").length,
        },
        facets: {
          category: categoryFacets.map((f) => ({
            value: f.category,
            count: f._count._all,
          })),
          language: languageFacets.map((f) => ({
            value: f.language,
            count: f._count._all,
          })),
        },
      };
    }),

  toggleFavorite: orgProcedure
    .input(z.object({ voiceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const voice = await prisma.voice.findFirst({
        where: {
          id: input.voiceId,
          OR: [
            { variant: "SYSTEM" },
            { variant: "CUSTOM", orgId: ctx.orgId },
          ],
        },
        select: { id: true },
      });
      if (!voice) throw new TRPCError({ code: "NOT_FOUND", message: "Voice not found" });

      const existing = await prisma.voiceFavorite.findUnique({
        where: { voiceId_userId: { voiceId: input.voiceId, userId: ctx.userId } },
        select: { id: true },
      });

      if (existing) {
        await prisma.voiceFavorite.delete({ where: { id: existing.id } });
        return { isFavorite: false };
      }

      await prisma.voiceFavorite.create({
        data: {
          voiceId: input.voiceId,
          userId: ctx.userId,
          orgId: ctx.orgId,
        },
      });
      return { isFavorite: true };
    }),

  delete: orgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const voice = await prisma.voice.findUnique({
        where: {
          id: input.id,
          variant: "CUSTOM",
          orgId: ctx.orgId,
        },
        select: { id: true, r2ObjectKey: true },
      });

      if (!voice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Voice not found",
        });
      }

      await prisma.voice.delete({ where: { id: voice.id } });

      if (voice.r2ObjectKey) {
        await deleteAudio(voice.r2ObjectKey).catch(() => {});
      }

      return { success: true };
    }),
});
