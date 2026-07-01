import type { Metadata } from "next";
import { api } from "@/lib/api";
import RecipeForm from "@/components/RecipeForm";

export const metadata: Metadata = {
  title: "Yeni Tarif Ekle",
  robots: { index: false, follow: false },
};

export default async function NewRecipePage() {
  const tree = await api.getCategoryTree();

  return (
    <main className="container">
      <h1 className="page-title">Yeni Tarif Ekle</h1>
      <RecipeForm tree={tree} />
    </main>
  );
}
