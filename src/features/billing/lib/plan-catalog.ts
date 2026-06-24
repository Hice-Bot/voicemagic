export const PLAN_CATALOG = {
  free: {
    key: "free",
    label: "Free",
    monthlyCredits: 10_000,
    voiceCloneLimit: 1,
  },
  standard: {
    key: "standard",
    label: "Standard",
    monthlyCredits: 250_000,
    voiceCloneLimit: 10,
  },
  pro: {
    key: "pro",
    label: "Pro",
    monthlyCredits: 1_000_000,
    voiceCloneLimit: 50,
  },
} as const;

export type PlanKey = keyof typeof PLAN_CATALOG;

export function isPlanKey(value: string | undefined): value is PlanKey {
  return value === "free" || value === "standard" || value === "pro";
}

export function getPlanCatalogEntry(planKey: PlanKey) {
  return PLAN_CATALOG[planKey];
}

export function formatCredits(value: number) {
  if (value >= 1_000_000) {
    return `${value / 1_000_000}M`;
  }

  if (value >= 1_000) {
    return `${value / 1_000}k`;
  }

  return value.toLocaleString();
}

export function formatVoiceCloneLimit(value: number) {
  return `${value.toLocaleString()} custom ${value === 1 ? "voice" : "voices"}`;
}
