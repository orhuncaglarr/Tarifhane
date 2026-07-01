import Link from "next/link";
import type { RecipeListItem } from "@tarifhane/shared";
import AdSlot from "./AdSlot";

const AD_INTERVAL = 6;

export default function RecipeGrid({ recipes }: { recipes: RecipeListItem[] }) {
  if (recipes.length === 0) {
    return <p className="empty-state">Bu alt kategoride henüz tarif yok.</p>;
  }

  const items: React.ReactNode[] = [];
  recipes.forEach((recipe, index) => {
    items.push(
      <Link key={recipe.id} href={`/tarif/${recipe.slug}`} className="card">
        <h3>{recipe.title}</h3>
        {recipe.description && <p>{recipe.description}</p>}
        <span className="like-badge">♥ {recipe.like_count}</span>
      </Link>
    );
    if ((index + 1) % AD_INTERVAL === 0 && index !== recipes.length - 1) {
      items.push(<AdSlot key={`ad-${recipe.id}`} />);
    }
  });

  return <div className="grid">{items}</div>;
}
