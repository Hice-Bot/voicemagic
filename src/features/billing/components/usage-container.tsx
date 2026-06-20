import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCheckout } from "@/features/billing/hooks/use-checkout";
import { useTRPC } from "@/trpc/client";

function UpgradeCard() {
  const { checkout, isPending: isCheckoutPending } = useCheckout();

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold tracking-tight text-foreground">
          Free plan
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Upgrade when you need more shared credits for web, API, and MCP usage.
        </p>
      </div>
      <Button
        variant="outline"
        className="w-full text-xs"
        size="sm"
        disabled={isCheckoutPending}
        onClick={checkout}
      >
        {isCheckoutPending ? (
          <>
            <Spinner className="size-3" />
            Redirecting...
          </>
        ) : (
          "Choose plan"
        )}
      </Button>
    </div>
  );
}

function UsageCard({
  isSimulated,
  planLabel,
}: {
  isSimulated: boolean;
  planLabel: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold tracking-tight text-foreground">
          Current plan
        </p>
        <p className="text-xl font-bold tracking-tight text-foreground mt-1">
          {planLabel}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isSimulated ? "Simulated Clerk billing" : "Clerk billing"}
        </p>
      </div>
      <Button
        variant="outline"
        className="w-full text-xs"
        size="sm"
        onClick={() => {
          window.location.href = "/pricing";
        }}
      >
        Manage plan
      </Button>
    </div>
  );
}

export function UsageContainer() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.billing.getStatus.queryOptions());

  return (
    <div className="group-data-[collapsible=icon]:hidden bg-background border border-border rounded-lg p-3">
      {data?.hasActiveSubscription ? (
        <UsageCard
          isSimulated={data.isSimulated}
          planLabel={data.planLabel}
        />
      ) : (
        <UpgradeCard />
      )}
    </div>
  );
}
