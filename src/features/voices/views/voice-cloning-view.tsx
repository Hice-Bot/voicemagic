"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Mic, Trash2, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

import { useCheckout } from "@/features/billing/hooks/use-checkout";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { VoiceCreateForm } from "../components/voice-create-form";

function ClonedVoiceCard({
  voice,
  onDelete,
  isDeleting,
}: {
  voice: { id: string; name: string; category: string | null; createdAt: Date };
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Mic className="size-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{voice.name}</p>
        <p className="text-xs text-muted-foreground capitalize">
          {voice.category?.toLowerCase().replace("_", " ") ?? "General"}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(voice.id)}
        disabled={isDeleting}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

export function VoiceCloningView() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { checkout } = useCheckout();

  const { data: voicesData, isLoading: voicesLoading } = useQuery(
    trpc.voices.getAll.queryOptions({ view: "cloned" })
  );

  const { data: billingData } = useQuery(trpc.billing.getStatus.queryOptions());

  const deleteMutation = useMutation(
    trpc.voices.delete.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries(trpc.voices.getAll.queryFilter());
        toast.success("Voice deleted");
      },
      onError() {
        toast.error("Failed to delete voice");
      },
    })
  );

  const handleError = useCallback(
    (message: string) => {
      if (message === "SUBSCRIPTION_REQUIRED") {
        toast.error("Subscription required", {
          action: { label: "Subscribe", onClick: () => checkout() },
        });
      } else {
        toast.error(message);
      }
    },
    [checkout],
  );

  const handleSuccess = useCallback(() => {
    router.push("/voices?view=cloned");
  }, [router]);

  const clonedVoices = voicesData?.voices ?? [];
  const slotsUsed = clonedVoices.length;
  const slotsTotal = billingData?.voiceCloneLimit ?? 1;
  const slotsRemaining = Math.max(0, slotsTotal - slotsUsed);
  const atLimit = slotsUsed >= slotsTotal;

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-5xl mx-auto w-full min-h-0">
      {/* Left column — existing voices + plan */}
      <div className="flex flex-col gap-4 lg:w-72 shrink-0">
        <Link
          href="/voices"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="size-4" />
          Back to voices
        </Link>

        {/* Plan status */}
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Voice clones</p>
            <Badge variant="secondary" className="text-xs">
              {billingData?.planLabel ?? "Free"}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {slotsUsed} / {slotsTotal} used - {slotsRemaining} remaining
          </span>

          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, (slotsUsed / slotsTotal) * 100)}%` }}
            />
          </div>

          {atLimit && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">
                You&apos;ve reached the {billingData?.planLabel ?? "Free"} plan limit. Choose a larger plan for more custom voices.
              </p>
              <Button size="sm" onClick={checkout} className="w-full">
                <Sparkles className="size-3.5" />
                Upgrade
              </Button>
            </div>
          )}
        </div>

        {/* Cloned voices list */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Your clones</p>
            {clonedVoices.length > 0 && (
              <Link
                href="/voices?view=cloned"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View all
                <ArrowRight className="size-3" />
              </Link>
            )}
          </div>

          {voicesLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : clonedVoices.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No cloned voices yet. Create your first one using the form.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {clonedVoices.map((v) => (
                <ClonedVoiceCard
                  key={v.id}
                  voice={v}
                  onDelete={(id) => deleteMutation.mutate({ id })}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right column — create form */}
      <div className="flex flex-col gap-4 flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Mic className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Clone a voice</h1>
            <p className="text-sm text-muted-foreground">
              Upload or record at least 10 seconds of clear audio.
            </p>
          </div>
        </div>

        {atLimit ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 gap-3 text-center">
            <Mic className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Voice clone limit reached</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Choose a larger plan to create more custom voices.
            </p>
            <Button onClick={checkout}>
              <Sparkles className="size-4" />
              Upgrade now
            </Button>
          </div>
        ) : (
          <VoiceCreateForm onError={handleError} onSuccess={handleSuccess} />
        )}
      </div>
    </div>
  );
}
