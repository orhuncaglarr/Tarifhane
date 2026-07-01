"use client";

import { useState, useTransition } from "react";
import { api } from "@/lib/api";

export default function LikeButton({
  recipeId,
  initialLiked,
  initialCount,
}: {
  recipeId: number;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const nextLiked = !liked;
    const nextCount = count + (nextLiked ? 1 : -1);
    setLiked(nextLiked);
    setCount(nextCount);

    startTransition(async () => {
      try {
        const result = await api.toggleLike(recipeId);
        setLiked(result.active);
        if (typeof result.like_count === "number") {
          setCount(result.like_count);
        }
      } catch {
        setLiked(!nextLiked);
        setCount(count);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`icon-btn like${liked ? " active" : ""}`}
      aria-pressed={liked}
    >
      ♥ Beğen ({count})
    </button>
  );
}
