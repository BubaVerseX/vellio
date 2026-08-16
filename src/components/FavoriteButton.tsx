"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite, type FavoriteItemType } from "@/lib/actions/favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  itemType,
  itemId,
  initialFavorited,
  className,
}: {
  itemType: FavoriteItemType;
  itemId: string;
  initialFavorited: boolean;
  className?: string;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    setFavorited((v) => !v);
    startTransition(async () => {
      const result = await toggleFavorite(itemType, itemId);
      if (result.error) setFavorited((v) => !v);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
        favorited ? "soft-pressed" : "soft-raised",
        className
      )}
    >
      <Heart
        strokeWidth={1.8}
        className={cn(
          "h-4 w-4",
          favorited ? "fill-[var(--color-accent)] text-[var(--color-accent)]" : "text-[var(--color-text-tertiary)]"
        )}
      />
    </button>
  );
}
