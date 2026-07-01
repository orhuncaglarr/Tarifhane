import type { Metadata } from "next";
import CategoryGrid from "@/components/CategoryGrid";
import RecipeGrid from "@/components/RecipeGrid";
import SearchBar from "@/components/SearchBar";
import { api } from "@/lib/api";

export const metadata: Metadata = {
  title: "Arama Sonuçları",
  robots: { index: false, follow: false },
};

export const revalidate = 0;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  if (!query) {
    return (
      <main className="container">
        <div className="home-search">
          <h1 className="page-title">Arama</h1>
          <SearchBar />
        </div>
      </main>
    );
  }

  const results = await api.search(query);
  const hasResults = results.recipes.length > 0 || results.categories.length > 0;

  return (
    <main className="container">
      <div className="home-search">
        <h1 className="page-title">&ldquo;{query}&rdquo; için sonuçlar</h1>
        <SearchBar initialQuery={query} />
      </div>

      {!hasResults && <p className="empty-state">Sonuç bulunamadı.</p>}

      {results.categories.length > 0 && (
        <section className="recipe-section">
          <h2>Kategoriler</h2>
          <CategoryGrid categories={results.categories} />
        </section>
      )}

      {results.recipes.length > 0 && (
        <section className="recipe-section">
          <h2>Tarifler</h2>
          <RecipeGrid recipes={results.recipes} />
        </section>
      )}
    </main>
  );
}
