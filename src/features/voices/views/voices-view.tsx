"use client";

import { Sparkles } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useQueryState } from "nuqs";
import { useSuspenseQuery } from "@tanstack/react-query";

import { VoiceCard } from "../components/voice-card";
import { VoicesToolbar } from "../components/voices-toolbar";
import Link from "next/link";
import { voicesSearchParams } from "../lib/params";

function EmptyState({ view }: { view: string }) {
  if (view === "favorites") {
    return (
      <div className="vx-empty">
        <p className="vx-empty-title">No favorites yet</p>
        <p className="vx-empty-sub">
          Tap the heart on any voice card to pin it here for quick access.
        </p>
      </div>
    );
  }
  if (view === "cloned") {
    return (
      <div className="vx-empty">
        <p className="vx-empty-title">You haven&apos;t cloned a voice yet</p>
        <p className="vx-empty-sub">
          Record 10 seconds to create your first custom voice.
        </p>
        <Link href="/voice-cloning" className="app-btn-p">
          <Sparkles size={14} />
          Clone a voice
        </Link>
      </div>
    );
  }
  return (
    <div className="vx-empty">
      <p className="vx-empty-title">No voices match your filters</p>
      <p className="vx-empty-sub">
        Try clearing a filter or searching for something else.
      </p>
    </div>
  );
}

export function VoicesView() {
  const trpc = useTRPC();
  const [query] = useQueryState("query", voicesSearchParams.query);
  const [view] = useQueryState("view", voicesSearchParams.view);

  const { data } = useSuspenseQuery(
    trpc.voices.getAll.queryOptions({
      query: query || undefined,
      view,
    }),
  );

  return (
    <div className="app-page">
      <header className="vx-header">
        <div className="vx-header-meta">
          <h1 className="vx-title">Voices</h1>
          <p className="vx-sub">
            {data.counts.total} voices across {data.facets.language.length} languages.
            Clone your own, or pick from the library.
          </p>
        </div>
        <div className="vx-header-actions">
          <Link href="/voice-cloning" className="app-btn-p">
            <Sparkles size={14} />
            Clone a voice
          </Link>
        </div>
      </header>

      <div className="vx-shell">
        <div>
          <VoicesToolbar counts={data.counts} />
          {data.voices.length === 0 ? (
            <EmptyState view={view} />
          ) : (
            <div className="vx-grid">
              {data.voices.map((v) => (
                <VoiceCard key={v.id} voice={v} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
