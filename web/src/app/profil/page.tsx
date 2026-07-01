import Link from "next/link";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import RecipeGrid from "@/components/RecipeGrid";

export const metadata: Metadata = {
  title: "Profilim",
  robots: { index: false, follow: false },
};

export const revalidate = 0;

const TABS = [
  { key: "tariflerim", label: "Tariflerim" },
  { key: "begendiklerim", label: "Beğendiklerim" },
  { key: "favorilerim", label: "Favorilerim" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

async function loadTabRecipes(tab: TabKey) {
  if (tab === "begendiklerim") return api.getMyLikes();
  if (tab === "favorilerim") return api.getMyFavorites();
  return api.getMyRecipes();
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;
  const activeTab: TabKey = TABS.some((t) => t.key === tabParam) ? (tabParam as TabKey) : "tariflerim";

  const [profile, recipes] = await Promise.all([api.getMyProfile(), loadTabRecipes(activeTab)]);

  return (
    <main className="container">
      <h1 className="page-title">{profile.user.display_name}</h1>
      <p style={{ color: "var(--muted)" }}>
        {profile.recipe_count} tarif · {profile.like_count} beğeni · {profile.favorite_count} favori
      </p>

      <nav className="tabs">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/profil?tab=${t.key}`}
            className={t.key === activeTab ? "active" : ""}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <RecipeGrid recipes={recipes} />
    </main>
  );
}
