"use client";

import { useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCheckout } from "@/features/billing/hooks/use-checkout";
import { useTRPC } from "@/trpc/client";

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function AccountSubscriptionPanel() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(trpc.billing.getStatus.queryOptions());
  const { checkout, isPending: isCheckoutPending } = useCheckout();

  const portalMutation = useMutation(
    trpc.billing.createPortalSession.mutationOptions({}),
  );

  const openPortal = useCallback(() => {
    portalMutation.mutate(undefined, {
      onSuccess: (res) => {
        window.open(res.portalUrl, "_blank");
      },
    });
  }, [portalMutation]);

  const hasSub = !!data?.hasActiveSubscription;

  return (
    <section className="flex flex-col gap-3">
      <header>
        <h2 className="text-lg font-semibold tracking-tight">Subscription & usage</h2>
        <p className="text-sm text-muted-foreground">
          Manage your plan, payment method, and track this period&apos;s usage.
        </p>
      </header>
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {hasSub ? "Current usage this period" : "Current plan"}
            </span>
            {isLoading ? (
              <Spinner className="size-4" />
            ) : hasSub ? (
              <span className="text-3xl font-semibold tracking-tight">
                {formatCurrency(data?.estimatedCostCents ?? 0)}
              </span>
            ) : (
              <span className="text-xl font-semibold tracking-tight">Free</span>
            )}
            {!hasSub && !isLoading && (
              <span className="text-xs text-muted-foreground">
                Upgrade to pay-as-you-go starting at $0.30 / 1,000 characters.
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {hasSub ? (
              <Button
                variant="outline"
                size="sm"
                disabled={portalMutation.isPending}
                onClick={openPortal}
              >
                {portalMutation.isPending ? (
                  <>
                    <Spinner className="size-3" />
                    Opening portal…
                  </>
                ) : (
                  "Manage subscription"
                )}
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={isCheckoutPending}
                onClick={checkout}
              >
                {isCheckoutPending ? (
                  <>
                    <Spinner className="size-3" />
                    Redirecting…
                  </>
                ) : (
                  "Upgrade"
                )}
              </Button>
            )}
          </div>
        </div>
        {hasSub && (
          <p className="mt-4 text-xs text-muted-foreground">
            The subscription portal lets you update payment details, change plan,
            download invoices, or cancel.
          </p>
        )}
      </div>
    </section>
  );
}
