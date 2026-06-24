"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatCredits } from "@/features/billing/lib/plan-catalog";
import { useTRPC } from "@/trpc/client";

export function AccountSubscriptionPanel() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(trpc.billing.getStatus.queryOptions());
  const hasSub = !!data?.hasActiveSubscription;

  return (
    <section className="flex flex-col gap-3">
      <header>
        <h2 className="text-lg font-semibold tracking-tight">Subscription & usage</h2>
        <p className="text-sm text-muted-foreground">
          Manage the shared credit plan that powers web, API, and MCP usage.
        </p>
      </header>
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Current plan
            </span>
            {isLoading ? (
              <Spinner className="size-4" />
            ) : (
              <span className="text-xl font-semibold tracking-tight">
                {data?.planLabel ?? "Free"}
              </span>
            )}
            {!isLoading && (
              <span className="text-xs text-muted-foreground">
                {data?.isSimulated
                  ? "Simulated Clerk billing is enabled for testing."
                  : "Web, API, and MCP usage all draw from this same credit base."}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant={hasSub ? "outline" : "default"} size="sm">
              <Link href="/pricing">{hasSub ? "Manage plan" : "Choose plan"}</Link>
            </Button>
          </div>
        </div>
        {hasSub && (
          <p className="mt-4 text-xs text-muted-foreground">
            Plan changes are handled by Clerk Billing. Your web dashboard, API
            keys, and MCP server all use the same plan credits.
          </p>
        )}
        {!isLoading && data && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Monthly credits</p>
              <p className="text-sm font-semibold">{formatCredits(data.monthlyCredits)}</p>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Credits remaining</p>
              <p className="text-sm font-semibold">{formatCredits(data.monthlyCreditsRemaining)}</p>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Custom voices</p>
              <p className="text-sm font-semibold">
                {data.voiceCloneCount} / {data.voiceCloneLimit}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
