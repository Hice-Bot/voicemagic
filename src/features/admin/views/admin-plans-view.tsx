"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

type Plan = {
  id: string;
  key: string;
  label: string;
  priceMonthly: number;
  voiceCloneLimit: number;
  ttsCharLimit: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
};

const emptyPlan = (): Omit<Plan, "id"> => ({
  key: "",
  label: "",
  priceMonthly: 0,
  voiceCloneLimit: 3,
  ttsCharLimit: -1,
  features: [],
  isActive: true,
  sortOrder: 0,
});

function formatLimit(n: number) {
  return n === -1 ? "Unlimited" : String(n);
}
function formatPrice(cents: number) {
  return cents === 0 ? "Free" : `$${(cents / 100).toFixed(2)}/mo`;
}

function PlanRow({
  plan,
  onEdit,
  onDelete,
  isDeleting,
}: {
  plan: Plan;
  onEdit: (p: Plan) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-medium">{plan.label}</span>
          <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{plan.key}</code>
        </div>
      </td>
      <td className="px-4 py-3 text-sm">{formatPrice(plan.priceMonthly)}</td>
      <td className="px-4 py-3 text-sm">{formatLimit(plan.voiceCloneLimit)} voices</td>
      <td className="px-4 py-3 text-sm">{formatLimit(plan.ttsCharLimit)} chars</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1 max-w-xs">
          {plan.features.slice(0, 3).map((f, i) => (
            <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
          ))}
          {plan.features.length > 3 && (
            <Badge variant="outline" className="text-xs">+{plan.features.length - 3}</Badge>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant={plan.isActive ? "default" : "outline"} className="text-xs">
          {plan.isActive ? "Active" : "Inactive"}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-7" onClick={() => onEdit(plan)}>
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="size-7 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(plan.id)}
            disabled={isDeleting}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function PlanForm({
  initial,
  onSave,
  onCancel,
  isPending,
}: {
  initial: Omit<Plan, "id"> & { id?: string };
  onSave: (data: Omit<Plan, "id"> & { id?: string }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [featuresText, setFeaturesText] = useState(initial.features.join("\n"));

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
      <h3 className="text-sm font-semibold">{form.id ? "Edit plan" : "New plan"}</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Key (unique, e.g. "free")</Label>
          <Input value={form.key} onChange={(e) => set("key", e.target.value)} placeholder="free" className="h-8 text-sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Display name</Label>
          <Input value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="Free" className="h-8 text-sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Price (cents/mo, 0 = free)</Label>
          <Input type="number" value={form.priceMonthly} onChange={(e) => set("priceMonthly", Number(e.target.value))} className="h-8 text-sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Sort order</Label>
          <Input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} className="h-8 text-sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Voice clone limit (-1 = unlimited)</Label>
          <Input type="number" value={form.voiceCloneLimit} onChange={(e) => set("voiceCloneLimit", Number(e.target.value))} className="h-8 text-sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">TTS char limit/mo (-1 = unlimited)</Label>
          <Input type="number" value={form.ttsCharLimit} onChange={(e) => set("ttsCharLimit", Number(e.target.value))} className="h-8 text-sm" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Features (one per line)</Label>
        <textarea
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-20 resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={featuresText}
          onChange={(e) => {
            setFeaturesText(e.target.value);
            set("features", e.target.value.split("\n").filter(Boolean));
          }}
          placeholder={"200+ voices\nVoice cloning\nAPI access"}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="isActive"
          checked={form.isActive}
          onCheckedChange={(v) => set("isActive", v)}
        />
        <Label htmlFor="isActive" className="text-sm">Active (visible to users)</Label>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X className="size-3.5" /> Cancel
        </Button>
        <Button size="sm" onClick={() => onSave(form)} disabled={isPending}>
          <Check className="size-3.5" /> {isPending ? "Saving…" : "Save plan"}
        </Button>
      </div>
    </div>
  );
}

export function AdminPlansView() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<(Omit<Plan, "id"> & { id?: string }) | null>(null);

  const { data: plans, isLoading } = useQuery(trpc.admin.getPlans.queryOptions());

  const upsertMut = useMutation(
    trpc.admin.upsertPlan.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries(trpc.admin.getPlans.queryFilter());
        setEditing(null);
        toast.success("Plan saved");
      },
      onError() { toast.error("Failed to save plan"); },
    })
  );

  const deleteMut = useMutation(
    trpc.admin.deletePlan.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries(trpc.admin.getPlans.queryFilter());
        toast.success("Plan deleted");
      },
      onError() { toast.error("Failed to delete plan"); },
    })
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure subscription tiers and their limits</p>
        </div>
        {!editing && (
          <Button size="sm" onClick={() => setEditing(emptyPlan())}>
            <Plus className="size-4" /> New plan
          </Button>
        )}
      </div>

      {editing && (
        <PlanForm
          initial={editing}
          onSave={(data) => upsertMut.mutate(data)}
          onCancel={() => setEditing(null)}
          isPending={upsertMut.isPending}
        />
      )}

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Plan</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Price</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Voices</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">TTS chars</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Features</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
              <th className="w-20 px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 2 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3" />
                  </tr>
                ))
              : plans?.map((plan) => (
                  <PlanRow
                    key={plan.id}
                    plan={plan}
                    onEdit={setEditing}
                    onDelete={(id) => deleteMut.mutate({ id })}
                    isDeleting={deleteMut.isPending}
                  />
                ))}
          </tbody>
        </table>
        {!isLoading && (plans?.length ?? 0) === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No plans yet. Click &quot;New plan&quot; to create your first one.
          </div>
        )}
      </div>
    </div>
  );
}
