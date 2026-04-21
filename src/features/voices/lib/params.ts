import {
  createSearchParamsCache,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const VOICE_VIEWS = ["all", "favorites", "cloned"] as const;
export type VoiceView = (typeof VOICE_VIEWS)[number];

export const voicesSearchParams = {
  query: parseAsString.withDefault(""),
  view: parseAsStringEnum([...VOICE_VIEWS]).withDefault("all"),
  category: parseAsString.withDefault(""),
  language: parseAsString.withDefault(""),
};

export const voicesSearchParamsCache =
  createSearchParamsCache(voicesSearchParams);
