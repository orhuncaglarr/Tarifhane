"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/ara?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <input
        type="search"
        placeholder="Tarif, kategori ara..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Tarif ara"
      />
      <button type="submit">Ara</button>
    </form>
  );
}
