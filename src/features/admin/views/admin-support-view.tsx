"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminConfigPanel } from "@/lib/supportbot/admin";
import type { SupportBotConfig } from "@/lib/supportbot";
import { DEFAULT_CONFIG } from "@/lib/supportbot";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { Trash2, Plus, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

function KbDocForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: { title: string; content: string };
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-4">
      <input
        className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="Document title (e.g. Pricing FAQ)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        rows={8}
        className="resize-y rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="Paste document content here. Markdown is supported."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button size="sm" onClick={() => onSave(title, content)} disabled={saving || !title.trim() || !content.trim()}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

function KbDocRow({
  doc,
  onDelete,
  onUpdate,
}: {
  doc: { id: string; title: string; content: string };
  onDelete: (id: string) => void;
  onUpdate: (id: string, title: string, content: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave(title: string, content: string) {
    setSaving(true);
    await onUpdate(doc.id, title, content);
    setSaving(false);
    setEditing(false);
  }

  if (editing) {
    return (
      <KbDocForm
        initial={doc}
        onSave={handleSave}
        onCancel={() => setEditing(false)}
        saving={saving}
      />
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <FileText className="size-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-sm font-medium truncate">{doc.title}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
          >
            <Trash2 className="size-3.5" />
          </Button>
          {expanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </div>
      </div>
      {expanded && (
        <div className="border-t border-border px-4 py-3">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono max-h-60 overflow-y-auto">
            {doc.content}
          </pre>
        </div>
      )}
    </div>
  );
}

export function AdminSupportView() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingSaving, setAddingSaving] = useState(false);

  const { data, isLoading } = useQuery(trpc.admin.getSupportConfig.queryOptions());

  const upsertMutation = useMutation(
    trpc.admin.upsertSupportConfig.mutationOptions({
      onSuccess() { toast.success("Support config saved"); },
      onError() { toast.error("Failed to save config"); },
    })
  );

  const addKbMutation = useMutation(
    trpc.admin.addKbDoc.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries(trpc.admin.getSupportConfig.queryFilter());
        setShowAddForm(false);
      },
      onError() { toast.error("Failed to add document"); },
    })
  );

  const updateKbMutation = useMutation(
    trpc.admin.updateKbDoc.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries(trpc.admin.getSupportConfig.queryFilter());
        toast.success("Document updated");
      },
      onError() { toast.error("Failed to update document"); },
    })
  );

  const deleteKbMutation = useMutation(
    trpc.admin.deleteKbDoc.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries(trpc.admin.getSupportConfig.queryFilter());
        toast.success("Document deleted");
      },
      onError() { toast.error("Failed to delete document"); },
    })
  );

  if (isLoading) {
    return (
      <div className="max-w-2xl animate-pulse space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-lg bg-muted" />)}
      </div>
    );
  }

  const savedModel = data?.model?.includes("/") ? data.model : DEFAULT_CONFIG.model;
  const config: SupportBotConfig = { ...DEFAULT_CONFIG, ...(data ?? {}), model: savedModel };
  const kbDocs = data?.knowledgeBase ?? [];

  async function handleAddDoc(title: string, content: string) {
    setAddingSaving(true);
    await addKbMutation.mutateAsync({ title, content });
    setAddingSaving(false);
  }

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      <AdminConfigPanel
        config={config}
        onSave={async (updated) => { await upsertMutation.mutateAsync(updated); }}
      />

      {/* Knowledge Base */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Knowledge Base</h2>
            <p className="text-sm text-muted-foreground">
              Documents the AI references when answering questions. Each doc is appended to the system prompt.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowAddForm(true)} disabled={showAddForm}>
            <Plus className="size-3.5" />
            Add document
          </Button>
        </div>

        {showAddForm && (
          <KbDocForm
            onSave={handleAddDoc}
            onCancel={() => setShowAddForm(false)}
            saving={addingSaving}
          />
        )}

        {kbDocs.length === 0 && !showAddForm ? (
          <div className="rounded-lg border border-dashed border-border py-10 text-center">
            <FileText className="mx-auto mb-2 size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No documents yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add product docs, FAQs, or pricing info to help the AI answer accurately.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {kbDocs.map((doc) => (
              <KbDocRow
                key={doc.id}
                doc={doc}
                onDelete={(id) => deleteKbMutation.mutate({ id })}
                onUpdate={(id, title, content) => updateKbMutation.mutateAsync({ id, title, content })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
