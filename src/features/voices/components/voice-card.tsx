"use client";

import Link from "next/link";
import { Heart, Mic, MoreHorizontal, Pause, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { inferRouterOutputs } from "@trpc/server";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import type { AppRouter } from "@/trpc/routers/_app";
import { VOICE_CATEGORY_LABELS } from "@/features/voices/data/voice-categories";
import { useAudioPlayback } from "@/hooks/use-audio-playback";
import { useTRPC } from "@/trpc/client";

export type VoiceItem =
  inferRouterOutputs<AppRouter>["voices"]["getAll"]["voices"][number];

interface VoiceCardProps {
  voice: VoiceItem;
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function parseLanguage(locale: string) {
  const [, country] = locale.split("-");
  if (!country) return { flag: "", region: locale };
  const flag = [...country.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
  const region = regionNames.of(country) ?? country;
  return { flag, region };
}

export function VoiceCard({ voice }: VoiceCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [optimisticFav, setOptimisticFav] = useState<boolean | null>(null);
  const { flag, region } = parseLanguage(voice.language);

  const audioSrc = `/api/voices/${encodeURIComponent(voice.id)}`;
  const { isPlaying, isLoading, togglePlay } = useAudioPlayback(audioSrc);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const isFav = optimisticFav ?? voice.isFavorite;
  const isCloned = voice.variant === "CUSTOM";

  const toggleFavorite = useMutation(
    trpc.voices.toggleFavorite.mutationOptions({
      onMutate: () => setOptimisticFav(!isFav),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.voices.getAll.queryKey() });
      },
      onError: () => {
        setOptimisticFav(null);
        toast.error("Couldn't update favorite");
      },
      onSettled: () => setOptimisticFav(null),
    }),
  );

  const deleteMutation = useMutation(
    trpc.voices.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Voice deleted");
        queryClient.invalidateQueries({ queryKey: trpc.voices.getAll.queryKey() });
      },
      onError: (e) => toast.error(e.message ?? "Failed to delete voice"),
    }),
  );

  return (
    <article
      className={[
        "vx-card",
        isPlaying ? "playing" : "",
        isCloned ? "cloned" : "",
      ].filter(Boolean).join(" ")}
    >
      <div className="vx-card-top">
        <VoiceAvatar
          seed={voice.id}
          name={voice.name}
          className="vx-card-avatar size-11"
        />
        <div className="vx-card-meta">
          <h3 className="vx-card-name">
            <span className="vx-card-name-text">{voice.name}</span>
            {isCloned && <span className="vx-cloned-badge">Cloned</span>}
          </h3>
          <div className="vx-card-cat">
            {VOICE_CATEGORY_LABELS[voice.category]}
          </div>
        </div>
        <button
          type="button"
          className={`vx-card-fav ${isFav ? "on" : ""}`}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFav}
          onClick={() => toggleFavorite.mutate({ voiceId: voice.id })}
        >
          <Heart
            size={17}
            fill={isFav ? "currentColor" : "none"}
            strokeWidth={2}
          />
        </button>
      </div>

      {voice.description ? (
        <p className="vx-card-desc">{voice.description}</p>
      ) : (
        <p className="vx-card-desc" aria-hidden="true" />
      )}

      <div className="vx-card-foot">
        <span className="vx-card-lang">
          <span aria-hidden="true">{flag}</span>
          {region}
        </span>
        <div className="vx-card-actions">
          <button
            type="button"
            className="vx-card-play"
            aria-label={isPlaying ? "Pause" : "Play preview"}
            onClick={togglePlay}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner className="size-4" />
            ) : isPlaying ? (
              <Pause size={14} fill="currentColor" />
            ) : (
              <Play size={14} fill="currentColor" style={{ marginLeft: 1 }} />
            )}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="vx-card-menu" aria-label="More">
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/text-to-speech?voiceId=${voice.id}`}>
                  <Mic className="size-4" />
                  <span>Use this voice</span>
                </Link>
              </DropdownMenuItem>
              {isCloned && (
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-4 text-destructive" />
                  <span>Delete voice</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isCloned && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete voice</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{voice.name}&quot;? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={(e) => {
                  e.preventDefault();
                  deleteMutation.mutate(
                    { id: voice.id },
                    { onSuccess: () => setShowDeleteDialog(false) },
                  );
                }}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </article>
  );
}
