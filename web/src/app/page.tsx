import { api } from "@/lib/api";
import CategoryTree from "@/components/CategoryTree";

export const revalidate = 60;

export default async function HomePage() {
  const tree = await api.getCategoryTree();

  return (
    <main className="container">
      <h1 className="page-title">Tarifhane</h1>
      <p style={{ color: "var(--muted)" }}>
        Türkçe yemek tariflerini kategori kategori keşfedin.
      </p>
      <CategoryTree nodes={tree} />
    </main>
  );
}
