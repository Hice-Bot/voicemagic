"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";

function formatDate(d: Date | string) {
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(text: string, max = 80) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export function AdminGenerationsView() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery(
    trpc.admin.getGenerations.infiniteQueryOptions(
      { limit: 50 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    )
  );

  const deleteMut = useMutation(
    trpc.admin.deleteGeneration.mutationOptions({
      onSuccess() {
        void queryClient.invalidateQueries(trpc.admin.getGenerations.queryFilter());
        void queryClient.invalidateQueries(trpc.admin.getOverview.queryFilter());
        toast.success("Generation deleted");
      },
      onError() {
        toast.error("Failed to delete generation");
      },
    })
  );

  const allItems = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Generations</h1>
        <p className="text-sm text-muted-foreground mt-1">All TTS generations across all users</p>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Text</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Voice</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">User</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Date</th>
              <th className="w-10 px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-56" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-28 ml-auto" /></td>
                    <td className="px-4 py-3" />
                  </tr>
                ))
              : allItems.map((gen) => (
                  <tr key={gen.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs max-w-xs">
                      {truncate(gen.text)}
                    </td>
                    <td className="px-4 py-3">{gen.voiceName}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="size-6 shrink-0 rounded-md">
                          {gen.user.imageUrl && (
                            <AvatarImage src={gen.user.imageUrl} alt={gen.user.name} />
                          )}
                          <AvatarFallback className="rounded-md text-[10px]">
                            {(gen.user.name[0] ?? "?").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-col leading-tight">
                          <span className="truncate text-[13px]">{gen.user.name}</span>
                          {gen.user.email && (
                            <span className="truncate text-[11px] text-muted-foreground">
                              {gen.user.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground whitespace-nowrap">
                      {formatDate(gen.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteMut.mutate({ id: gen.id })}
                        disabled={deleteMut.isPending}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && allItems.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">No generations yet</div>
        )}
      </div>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            <ChevronDown className="size-4 mr-1.5" />
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
