"use client";

import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Plus, Trash2, Key } from "lucide-react";
import { format } from "date-fns";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function maskKey(prefix: string) {
  return `${prefix}${"•".repeat(20)}`;
}

interface NewKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (key: string) => void;
}

function NewKeyDialog({ open, onOpenChange, onCreated }: NewKeyDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const createMutation = useMutation(
    trpc.apiKeys.create.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.apiKeys.getAll.queryFilter());
        onCreated(data.key);
        setName("");
      },
      onError: () => {
        toast.error("Failed to create API key");
      },
    }),
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      createMutation.mutate({ name: name.trim() });
    },
    [name, createMutation],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Give your key a name to identify it later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="key-name">Key name</Label>
            <Input
              id="key-name"
              placeholder="e.g. Production, My App"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <Button
            type="submit"
            disabled={!name.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create key"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface RevealKeyDialogProps {
  apiKey: string | null;
  onClose: () => void;
}

function RevealKeyDialog({ apiKey, onClose }: RevealKeyDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [apiKey]);

  return (
    <Dialog open={!!apiKey} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>API Key Created</DialogTitle>
          <DialogDescription>
            Copy this key now. You won&apos;t be able to see it again.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="rounded-md bg-muted border border-border p-3 break-all font-mono text-sm text-foreground">
            {apiKey}
          </div>
          <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
            Store this key safely — you won&apos;t see it again.
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              className="flex-1"
            >
              <Copy className="size-4 mr-2" />
              {copied ? "Copied!" : "Copy key"}
            </Button>
            <Button onClick={onClose} className="flex-1">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ApiKeysPanel() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  const { data: keys, isLoading } = useQuery(
    trpc.apiKeys.getAll.queryOptions(),
  );

  const revokeMutation = useMutation(
    trpc.apiKeys.revoke.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.apiKeys.getAll.queryFilter());
        toast.success("API key revoked");
      },
      onError: () => {
        toast.error("Failed to revoke API key");
      },
    }),
  );

  const handleKeyCreated = useCallback((key: string) => {
    setCreateDialogOpen(false);
    setRevealedKey(key);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            API Keys
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Use API keys to access the Voicemagic REST API and MCP server.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="size-4 mr-1.5" />
          Create key
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {isLoading ? (
          <div className="text-sm text-muted-foreground py-4 text-center">
            Loading...
          </div>
        ) : !keys?.length ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center border border-dashed border-border rounded-lg">
            <Key className="size-8 text-muted-foreground/50" />
            <div>
              <p className="text-sm font-medium text-foreground">No API keys yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Create a key to get started with the API.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="size-4 mr-1.5" />
              Create your first key
            </Button>
          </div>
        ) : (
          keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-3 gap-4"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-medium text-foreground truncate">
                  {key.name}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {maskKey(key.keyPrefix)}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5 shrink-0 text-xs text-muted-foreground">
                <span>Created {format(new Date(key.createdAt), "MMM d, yyyy")}</span>
                {key.lastUsedAt ? (
                  <span>Last used {format(new Date(key.lastUsedAt), "MMM d, yyyy")}</span>
                ) : (
                  <span>Never used</span>
                )}
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revoke API key?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The key &quot;{key.name}&quot; will be permanently deleted.
                      Any integrations using it will stop working immediately.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => revokeMutation.mutate({ id: key.id })}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Revoke key
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        )}
      </div>

      <NewKeyDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={handleKeyCreated}
      />

      <RevealKeyDialog
        apiKey={revealedKey}
        onClose={() => setRevealedKey(null)}
      />
    </div>
  );
}
