import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";

import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import type { VoiceCategory } from "@/generated/prisma/client";

import { VoicesView } from "@/features/voices/views/voices-view";
import { voicesSearchParamsCache } from "@/features/voices/lib/params";

export const metadata: Metadata = { title: "Voices" };

export default async function VoicesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { query, view, category, language } =
    await voicesSearchParamsCache.parse(searchParams);

  prefetch(
    trpc.voices.getAll.queryOptions({
      query: query || undefined,
      view,
      category: (category || undefined) as VoiceCategory | undefined,
      language: language || undefined,
    }),
  );

  return (
    <HydrateClient>
      <VoicesView />
    </HydrateClient>
  );
};
