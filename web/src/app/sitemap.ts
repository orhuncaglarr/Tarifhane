import type { MetadataRoute } from "next";
import type { CategoryNode } from "@tarifhane/shared";
import { api } from "@/lib/api";
import { SITE_URL } from "@/lib/config";

function collectRecipeUrls(nodes: CategoryNode[], entries: MetadataRoute.Sitemap) {
  for (const node of nodes) {
    for (const recipe of node.recipes) {
      entries.push({
        url: `${SITE_URL}/tarif/${recipe.slug}`,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
    collectRecipeUrls(node.children, entries);
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tree = await api.getCategoryTree();

  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
  ];
  collectRecipeUrls(tree, entries);

  return entries;
}
