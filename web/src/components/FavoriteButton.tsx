"use client";

import { useState, useTransition } from "react";
import { api } from "@/lib/api";

export default function FavoriteButton({
  recipeId,
  initialFavorited,
}: {
  recipeId: number;
  initialFavorited: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next = !favorited;
    setFavorited(next);

    startTransition(async () => {
      try {
        const result = await api.toggleFavorite(recipeId);
        setFavorited(result.active);
      } catch {
        setFavorited(!next);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`icon-btn favorite${favorited ? " active" : ""}`}
      aria-pressed={favorited}
    >
      ★ Favorile
    </button>
  );
}
