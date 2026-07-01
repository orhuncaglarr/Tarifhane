import type { Category } from "@tarifhane/shared";

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return <p className="empty-state">Henüz kategori eklenmedi.</p>;
  }

  return (
    <div className="grid">
      {categories.map((category) => (
        <a key={category.id} href={`/?cat=${category.slug}#cat-${category.slug}`} className="card">
          <h3>{category.name}</h3>
        </a>
      ))}
    </div>
  );
}
