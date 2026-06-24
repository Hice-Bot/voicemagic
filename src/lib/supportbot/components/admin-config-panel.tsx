"use client";

import React, { useState } from "react";
import type { AdminConfigProps, SupportBotConfig } from "../types";
import { DEFAULT_CONFIG } from "../types";
import { cn } from "../lib/utils";

const MODELS = [
  { value: "minimax/minimax-m3", label: "MiniMax M3 via OpenRouter (latest)" },
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

export function AdminConfigPanel({ config, onSave, className }: AdminConfigProps) {
  const [form, setForm] = useState<SupportBotConfig>({ ...DEFAULT_CONFIG, ...config });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof SupportBotConfig>(key: K, value: SupportBotConfig[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50";

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Support Chat</h2>
          <p className="text-sm text-muted-foreground">Configure the AI support widget</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-5">
        <Field label="Widget title" hint="Shown in the chat header">
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputClass}
            placeholder="Support"
          />
        </Field>

        <Field label="Welcome message" hint="Shown when the chat first opens">
          <input
            type="text"
            value={form.welcomeMessage}
            onChange={(e) => set("welcomeMessage", e.target.value)}
            className={inputClass}
            placeholder="Hi! How can I help you today?"
          />
        </Field>

        <Field label="Input placeholder">
          <input
            type="text"
            value={form.inputPlaceholder}
            onChange={(e) => set("inputPlaceholder", e.target.value)}
            className={inputClass}
            placeholder="Type a message..."
          />
        </Field>

        <Field label="Accent color" hint="Used for the widget bubble and header">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.accentColor}
              onChange={(e) => set("accentColor", e.target.value)}
              className="h-9 w-16 cursor-pointer rounded border border-input bg-background p-0.5"
            />
            <input
              type="text"
              value={form.accentColor}
              onChange={(e) => set("accentColor", e.target.value)}
              className={cn(inputClass, "flex-1")}
              placeholder="#6366f1"
            />
          </div>
        </Field>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Open by default</p>
            <p className="text-xs text-muted-foreground">Show the chat panel when the page loads</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.defaultOpen}
            onClick={() => set("defaultOpen", !form.defaultOpen)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              form.defaultOpen ? "bg-primary" : "bg-input"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block size-5 rounded-full bg-white shadow ring-0 transition-transform",
                form.defaultOpen ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-5">
        <Field
          label="AI model"
          hint="Support chat uses OpenRouter. Production needs OPENROUTER_API_KEY."
        >
          <select
            value={form.model}
            onChange={(e) => set("model", e.target.value)}
            className={inputClass}
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="System prompt"
          hint="Instructions that shape the AI's personality and knowledge"
        >
          <textarea
            rows={8}
            value={form.systemPrompt}
            onChange={(e) => set("systemPrompt", e.target.value)}
            className={cn(inputClass, "resize-y font-mono text-xs")}
            placeholder="You are a helpful support assistant..."
          />
        </Field>
      </div>
    </form>
  );
}
