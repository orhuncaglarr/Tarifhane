import { Suspense } from "react";
import { api } from "@/lib/api";
import CategoryTreeBrowse from "@/components/CategoryTreeBrowse";
import SearchBar from "@/components/SearchBar";

export const revalidate = 60;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const tree = await api.getCategoryTree();
  const { cat } = await searchParams;

  return (
    <main className="container container--wide">
      <div className="home-search">
        <h1 className="sr-only">Tarifhane</h1>
        <SearchBar />
      </div>
      <Suspense fallback={null}>
        <CategoryTreeBrowse tree={tree} initialSlug={cat} />
      </Suspense>
    </main>
  );
}
