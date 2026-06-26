"use client";

import { Coins } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatCredits } from "@/features/billing/lib/plan-catalog";
import { estimateCreditsForText } from "@/features/text-to-speech/data/constants";

export interface CreditEstimateStatus {
  planLabel: string;
  monthlyCredits: number;
}

function formatCreditShare(credits: number, monthlyCredits: number) {
  if (credits <= 0 || monthlyCredits <= 0) return "0%";

  const percent = (credits / monthlyCredits) * 100;
  if (percent < 0.1) return "<0.1%";
  if (percent < 10) return `${percent.toFixed(1)}%`;
  return `${Math.round(percent)}%`;
}

export function CreditEstimateBadge({
  text,
  status,
  idleLabel = "Start typing to estimate credits",
}: {
  text: string;
  status?: CreditEstimateStatus | null;
  idleLabel?: string;
}) {
  const estimatedCredits = estimateCreditsForText(text);

  return (
    <Badge
      variant="outline"
      className="max-w-full shrink justify-start gap-1.5 whitespace-normal border-dashed text-left leading-relaxed"
    >
      <Coins className="size-3 text-chart-5" />
      <span className="text-xs">
        {estimatedCredits === 0 ? (
          idleLabel
        ) : (
          <>
            <span className="tabular-nums">
              {estimatedCredits.toLocaleString()}
            </span>{" "}
            credits estimated
            {status ? (
              <span className="text-muted-foreground">
                {" "}
                - {formatCreditShare(estimatedCredits, status.monthlyCredits)} of{" "}
                {formatCredits(status.monthlyCredits)} {status.planLabel} monthly credits
              </span>
            ) : null}
          </>
        )}
      </span>
    </Badge>
  );
}
