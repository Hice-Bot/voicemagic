"use client";

import { useQueryState } from "nuqs";
import type { VoiceCategory } from "@/generated/prisma/client";

import { voicesSearchParams } from "../lib/params";
import { VOICE_CATEGORY_LABELS } from "../data/voice-categories";

interface FacetCount<T extends string = string> {
  value: T;
  count: number;
}

interface VoiceFilterSidebarProps {
  categoryFacets: FacetCount<VoiceCategory>[];
  languageFacets: FacetCount[];
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function languageLabel(locale: string) {
  const [, country] = locale.split("-");
  if (!country) return locale;
  const flag = [...country.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
  return `${flag}  ${regionNames.of(country) ?? country}`;
}

export function VoiceFilterSidebar({
  categoryFacets,
  languageFacets,
}: VoiceFilterSidebarProps) {
  const [category, setCategory] = useQueryState("category", voicesSearchParams.category);
  const [language, setLanguage] = useQueryState("language", voicesSearchParams.language);

  const totalCategoryCount = categoryFacets.reduce((a, f) => a + f.count, 0);
  const totalLanguageCount = languageFacets.reduce((a, f) => a + f.count, 0);

  const sortedCategories = [...categoryFacets].sort((a, b) => b.count - a.count);
  const sortedLanguages = [...languageFacets].sort((a, b) => b.count - a.count);

  return (
    <aside className="vx-sidebar">
      <div className="vx-sidebar-section">
        <p className="vx-sidebar-label">Category</p>
        <button
          type="button"
          className={`vx-filter-opt ${!category ? "on" : ""}`}
          onClick={() => setCategory("")}
        >
          <span className="vx-filter-label">All categories</span>
          <span className="vx-filter-count">{totalCategoryCount}</span>
        </button>
        {sortedCategories.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`vx-filter-opt ${category === f.value ? "on" : ""}`}
            onClick={() => setCategory(category === f.value ? "" : f.value)}
          >
            <span className="vx-filter-label">
              {VOICE_CATEGORY_LABELS[f.value]}
            </span>
            <span className="vx-filter-count">{f.count}</span>
          </button>
        ))}
      </div>

      <div className="vx-sidebar-section">
        <p className="vx-sidebar-label">Language</p>
        <button
          type="button"
          className={`vx-filter-opt ${!language ? "on" : ""}`}
          onClick={() => setLanguage("")}
        >
          <span className="vx-filter-label">All languages</span>
          <span className="vx-filter-count">{totalLanguageCount}</span>
        </button>
        {sortedLanguages.slice(0, 12).map((f) => (
          <button
            key={f.value}
            type="button"
            className={`vx-filter-opt ${language === f.value ? "on" : ""}`}
            onClick={() => setLanguage(language === f.value ? "" : f.value)}
          >
            <span className="vx-filter-label">{languageLabel(f.value)}</span>
            <span className="vx-filter-count">{f.count}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
