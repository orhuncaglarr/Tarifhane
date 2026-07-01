import { api } from "@/lib/api";
import CategoryTreemapBrowse from "@/components/CategoryTreemapBrowse";

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
      <h1 className="page-title">Tarifhane</h1>
      <p className="page-lead">Türkçe yemek tariflerini kategori kategori keşfedin.</p>
      <CategoryTreemapBrowse tree={tree} initialSlug={cat} />
    </main>
  );
}
