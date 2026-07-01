import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { CategoryNode } from "@tarifhane/shared";
import { api, ApiError } from "@/lib/api";
import LikeButton from "@/components/LikeButton";
import FavoriteButton from "@/components/FavoriteButton";
import IngredientList from "@/components/IngredientList";
import AdSlot from "@/components/AdSlot";
import { getYoutubeEmbedUrl } from "@/lib/youtube";

export const revalidate = 30;

function flattenRecipeSlugs(nodes: CategoryNode[]): string[] {
  return nodes.flatMap((node) => [
    ...node.recipes.map((recipe) => recipe.slug),
    ...flattenRecipeSlugs(node.children),
  ]);
}

export async function generateStaticParams() {
  const tree = await api.getCategoryTree();
  return flattenRecipeSlugs(tree).map((recipeSlug) => ({ recipeSlug }));
}

async function loadRecipe(recipeSlug: string) {
  try {
    return await api.getRecipe(recipeSlug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ recipeSlug: string }>;
}): Promise<Metadata> {
  const { recipeSlug } = await params;
  const recipe = await loadRecipe(recipeSlug);
  return {
    title: recipe.title,
    description: recipe.description || `${recipe.title} tarifi - Tarifhane`,
  };
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ recipeSlug: string }>;
}) {
  const { recipeSlug } = await params;
  const recipe = await loadRecipe(recipeSlug);

  return (
    <main className="container">
      <p className="breadcrumb">
        <Link href="/">Tarifhane</Link> / {recipe.title}
      </p>

      <div className="recipe-header">
        <h1 className="page-title">{recipe.title}</h1>
        {recipe.description && <p>{recipe.description}</p>}
      </div>

      <div className="recipe-actions">
        <LikeButton
          recipeId={recipe.id}
          initialLiked={recipe.is_liked_by_me}
          initialCount={recipe.like_count}
        />
        <FavoriteButton recipeId={recipe.id} initialFavorited={recipe.is_favorited_by_me} />
      </div>

      {recipe.ingredients.length > 0 && <IngredientList ingredients={recipe.ingredients} />}

      {recipe.instructions.length > 0 && (
        <section className="recipe-section">
          <h2>Hazırlanışı</h2>
          <ol>
            {recipe.instructions
              .slice()
              .sort((a, b) => a.step_number - b.step_number)
              .map((step) => (
                <li key={step.step_number}>{step.text}</li>
              ))}
          </ol>
        </section>
      )}

      {recipe.links.length > 0 && (
        <section className="recipe-section">
          <h2>Bağlantılar</h2>
          {recipe.links.map((link, i) => {
            const embedUrl = link.type === "youtube" ? getYoutubeEmbedUrl(link.url) : null;
            if (embedUrl) {
              return (
                <div className="video-embed" key={i}>
                  <iframe
                    src={embedUrl}
                    title={link.label || recipe.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              );
            }
            return (
              <p key={i}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.label || link.url}
                </a>
              </p>
            );
          })}
        </section>
      )}

      <AdSlot />
    </main>
  );
}
