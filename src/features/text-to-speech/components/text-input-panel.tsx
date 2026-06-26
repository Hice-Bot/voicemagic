"use client";

import { useStore } from "@tanstack/react-form";

import { SettingsDrawer } from "./settings-drawer";
import { HistoryDrawer } from "./history-drawer";
import { VoiceSelectorButton } from "./voice-selector-button";
import { CreditEstimateBadge, type CreditEstimateStatus } from "./credit-estimate-badge";

import { Textarea } from "@/components/ui/textarea";
import { useTypedAppFormContext } from "@/hooks/use-app-form";

import { TEXT_MAX_LENGTH } from "@/features/text-to-speech/data/constants";
import { ttsFormOptions } from "./text-to-speech-form";
import { GenerateButton } from "./generate-button";

export function TextInputPanel({
  creditStatus,
}: {
  creditStatus?: CreditEstimateStatus | null;
}) {
  const form = useTypedAppFormContext(ttsFormOptions);

  const text = useStore(form.store, (s) => s.values.text);
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
  const isValid = useStore(form.store, (s) => s.isValid);

  return (
    <div className="flex h-full min-h-0 flex-col flex-1 gap-3 p-4 lg:p-6">
      {/* Text input area */}
      <div className="relative min-h-0 flex-1 rounded-xl border border-white/8 bg-zinc-900/60 shadow-inner overflow-hidden">
        <form.Field name="text">
          {(field) => (
            <Textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Start typing or paste your text here..."
              className="absolute inset-0 resize-none border-0 bg-transparent p-4 pb-6 lg:p-6 lg:pb-8 text-base! leading-relaxed tracking-tight shadow-none wrap-break-word focus-visible:ring-0"
              maxLength={TEXT_MAX_LENGTH}
              disabled={isSubmitting}
            />
          )}
        </form.Field>
        {/* Bottom fade overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-zinc-900/60 to-transparent" />
      </div>
      {/* Action bar */}
      <div className="shrink-0">
        {/* Mobile layout */}
        <div className="flex flex-col gap-3 lg:hidden">
          <CreditEstimateBadge text={text} status={creditStatus} />
          <div className="flex items-center gap-2">
            <SettingsDrawer>
              <VoiceSelectorButton />
            </SettingsDrawer>
            <HistoryDrawer />
          </div>
          <GenerateButton
            className="w-full"
            disabled={isSubmitting}
            isSubmitting={isSubmitting}
            onSubmit={() => form.handleSubmit()}
          />
        </div>
        {/* Desktop layout */}
        <div className="hidden items-center justify-between lg:flex">
          <CreditEstimateBadge text={text} status={creditStatus} />
          <div className="flex items-center gap-3">
            <p className="text-xs tracking-tight">
              {text.length.toLocaleString()}
              <span className="text-muted-foreground">
                &nbsp;/&nbsp;{TEXT_MAX_LENGTH.toLocaleString()} characters
              </span>
            </p>
            <GenerateButton
              size="sm"
              disabled={isSubmitting || !isValid}
              isSubmitting={isSubmitting}
              onSubmit={() => form.handleSubmit()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
