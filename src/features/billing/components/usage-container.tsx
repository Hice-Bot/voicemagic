import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatCredits } from "@/features/billing/lib/plan-catalog";
import { useCheckout } from "@/features/billing/hooks/use-checkout";
import { useTRPC } from "@/trpc/client";

interface BillingStatus {
  hasActiveSubscription: boolean;
  isSimulated: boolean;
  planLabel: string;
  monthlyCredits: number;
  monthlyCreditsUsed: number;
  monthlyCreditsRemaining: number;
  voiceCloneLimit: number;
  voiceCloneCount: number;
}

function LoadingCard() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Spinner className="size-3" />
      Loading plan...
    </div>
  );
}

function UsageCard({ data }: { data: BillingStatus }) {
  const { checkout, isPending: isCheckoutPending } = useCheckout();
  const usedPercent = Math.min(
    100,
    Math.round((data.monthlyCreditsUsed / data.monthlyCredits) * 100),
  );

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold tracking-tight text-foreground">
          {data.planLabel} plan
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatCredits(data.monthlyCredits)} credits/month across web, API, and MCP.
        </p>
      </div>
      <div className="space-y-1.5">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${usedPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          {formatCredits(data.monthlyCreditsRemaining)} credits left this month
        </p>
        <p className="text-[11px] text-muted-foreground">
          {data.voiceCloneCount} / {data.voiceCloneLimit} custom voices
        </p>
      </div>
      <Button
        variant="outline"
        className="w-full text-xs"
        size="sm"
        disabled={isCheckoutPending && !data.hasActiveSubscription}
        onClick={() => {
          if (data.hasActiveSubscription) {
            window.location.href = "/pricing";
            return;
          }
          checkout();
        }}
      >
        {isCheckoutPending ? (
          <>
            <Spinner className="size-3" />
            Redirecting...
          </>
        ) : (
          data.hasActiveSubscription ? "Manage plan" : "Choose plan"
        )}
      </Button>
    </div>
  );
}

export function UsageContainer() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(trpc.billing.getStatus.queryOptions());

  return (
    <div className="group-data-[collapsible=icon]:hidden bg-background border border-border rounded-lg p-3">
      {isLoading || !data ? <LoadingCard /> : <UsageCard data={data} />}
    </div>
  );
}
