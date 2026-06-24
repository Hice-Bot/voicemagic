"use client";

import { useState } from "react";
import { Heart, Mic, Search } from "lucide-react";
import { useQueryState } from "nuqs";
import { useDebouncedCallback } from "use-debounce";

import { voicesSearchParams, type VoiceView } from "../lib/params";

interface VoicesToolbarProps {
  counts: { total: number; favorites: number; cloned: number };
}

const VIEWS: { id: Exclude<VoiceView, "all">; label: string; icon: typeof Mic; key: "favorites" | "cloned" }[] = [
  { id: "favorites", label: "Favorites",   icon: Heart,    key: "favorites" },
  { id: "cloned",    label: "My clones",   icon: Mic,      key: "cloned" },
];

export function VoicesToolbar({ counts }: VoicesToolbarProps) {
  const [view, setView] = useQueryState("view", voicesSearchParams.view);
  const [query, setQuery] = useQueryState("query", voicesSearchParams.query);
  const [local, setLocal] = useState(query);

  const debounced = useDebouncedCallback(
    (value: string) => setQuery(value),
    250,
  );

  return (
    <div className="vx-toolbar">
      <div className="vx-tabs" role="tablist">
        {VIEWS.map((v) => {
          const Icon = v.icon;
          const active = view === v.id;
          return (
            <button
              key={v.id}
              role="tab"
              aria-selected={active}
              className={`vx-tab ${active ? "on" : ""}`}
              onClick={() => setView(v.id)}
              type="button"
            >
              <Icon size={14} />
              <span>{v.label}</span>
              <span className="vx-tab-count">{counts[v.key]}</span>
            </button>
          );
        })}
      </div>

      <label className="vx-search">
        <Search size={15} />
        <input
          type="search"
          placeholder="Search by name or description…"
          value={local}
          onChange={(e) => {
            setLocal(e.target.value);
            debounced(e.target.value);
          }}
        />
      </label>
    </div>
  );
}
