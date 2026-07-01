"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CategoryNode, IngredientItem, LinkItem } from "@tarifhane/shared";
import { api } from "@/lib/api";

type IngredientRow = IngredientItem;
type StepRow = { text: string };
type LinkRow = LinkItem;

export default function RecipeForm({ tree }: { tree: CategoryNode[] }) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // One category id per depth level chosen so far, e.g. [anaYemeklerId, etYemekleriId, kofteleriId].
  const [selectedPath, setSelectedPath] = useState<number[]>([]);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([{ name: "", amount: "", unit: "" }]);
  const [steps, setSteps] = useState<StepRow[]>([{ text: "" }]);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [website, setWebsite] = useState(""); // honeypot - must stay empty
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // One array of sibling options per <select> rendered - grows as each level
  // is chosen, and stops once the chosen node has no children (a leaf).
  const levels = useMemo(() => {
    const result: CategoryNode[][] = [tree];
    let siblings = tree;
    for (const id of selectedPath) {
      const node = siblings.find((n) => n.id === id);
      if (!node || node.children.length === 0) break;
      result.push(node.children);
      siblings = node.children;
    }
    return result;
  }, [tree, selectedPath]);

  const categoryId = selectedPath[selectedPath.length - 1];

  function handleLevelChange(levelIndex: number, value: number | "") {
    setSelectedPath((prev) => {
      const next = prev.slice(0, levelIndex);
      if (value !== "") next.push(value);
      return next;
    });
  }

  function updateIngredient(index: number, patch: Partial<IngredientRow>) {
    setIngredients((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function updateStep(index: number, text: string) {
    setSteps((rows) => rows.map((row, i) => (i === index ? { text } : row)));
  }

  function updateLink(index: number, patch: Partial<LinkRow>) {
    setLinks((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!categoryId) {
      setError("Lütfen bir kategori seçin.");
      return;
    }

    setSubmitting(true);
    try {
      const recipe = await api.createRecipe({
        category_id: categoryId,
        title,
        description,
        ingredients: ingredients.filter((i) => i.name.trim()),
        instructions: steps
          .filter((s) => s.text.trim())
          .map((s, i) => ({ step_number: i + 1, text: s.text })),
        links: links.filter((l) => l.url.trim()),
        website,
      });
      router.push(`/tarif/${recipe.slug}`);
    } catch {
      setError("Tarif kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Honeypot: left empty by real users, hidden from view, not announced to screen readers */}
      <div className="honeypot-field" aria-hidden="true">
        <label htmlFor="website">Web sitesi</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="title">Tarif Adı</label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ör. Mercimek Çorbası"
        />
      </div>

      <div className="form-field">
        <label htmlFor="description">Açıklama</label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-row">
        {levels.map((options, levelIndex) => (
          <div className="form-field" key={levelIndex}>
            <label htmlFor={`category-level-${levelIndex}`}>
              {levelIndex === 0 ? "Kategori" : `Alt Kategori ${levelIndex + 1}`}
            </label>
            <select
              id={`category-level-${levelIndex}`}
              required={levelIndex === 0}
              value={selectedPath[levelIndex] ?? ""}
              onChange={(e) =>
                handleLevelChange(levelIndex, e.target.value ? Number(e.target.value) : "")
              }
            >
              <option value="">Seçin...</option>
              {options.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="recipe-section">
        <h2>Malzemeler</h2>
        {ingredients.map((row, i) => (
          <div className="form-row" key={i}>
            <input
              placeholder="Malzeme"
              value={row.name}
              onChange={(e) => updateIngredient(i, { name: e.target.value })}
            />
            <input
              placeholder="Miktar"
              value={row.amount ?? ""}
              onChange={(e) => updateIngredient(i, { amount: e.target.value })}
            />
            <input
              placeholder="Birim"
              value={row.unit ?? ""}
              onChange={(e) => updateIngredient(i, { unit: e.target.value })}
            />
            <button
              type="button"
              className="btn-small"
              onClick={() => setIngredients((rows) => rows.filter((_, idx) => idx !== i))}
            >
              Sil
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn-small"
          onClick={() => setIngredients((rows) => [...rows, { name: "", amount: "", unit: "" }])}
        >
          + Malzeme Ekle
        </button>
      </div>

      <div className="recipe-section">
        <h2>Hazırlanışı</h2>
        {steps.map((row, i) => (
          <div className="form-row" key={i}>
            <textarea
              placeholder={`Adım ${i + 1}`}
              value={row.text}
              onChange={(e) => updateStep(i, e.target.value)}
            />
            <button
              type="button"
              className="btn-small"
              onClick={() => setSteps((rows) => rows.filter((_, idx) => idx !== i))}
            >
              Sil
            </button>
          </div>
        ))}
        <button type="button" className="btn-small" onClick={() => setSteps((rows) => [...rows, { text: "" }])}>
          + Adım Ekle
        </button>
      </div>

      <div className="recipe-section">
        <h2>Bağlantılar (YouTube, vb.)</h2>
        {links.map((row, i) => (
          <div className="form-row" key={i}>
            <select value={row.type} onChange={(e) => updateLink(i, { type: e.target.value as LinkRow["type"] })}>
              <option value="youtube">YouTube</option>
              <option value="other">Diğer</option>
            </select>
            <input
              placeholder="URL"
              value={row.url}
              onChange={(e) => updateLink(i, { url: e.target.value })}
            />
            <input
              placeholder="Etiket (opsiyonel)"
              value={row.label ?? ""}
              onChange={(e) => updateLink(i, { label: e.target.value })}
            />
            <button
              type="button"
              className="btn-small"
              onClick={() => setLinks((rows) => rows.filter((_, idx) => idx !== i))}
            >
              Sil
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn-small"
          onClick={() => setLinks((rows) => [...rows, { type: "youtube", url: "", label: "" }])}
        >
          + Bağlantı Ekle
        </button>
      </div>

      {error && <p style={{ color: "var(--like)", marginTop: 12 }}>{error}</p>}

      <div style={{ marginTop: 24 }}>
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Kaydediliyor..." : "Tarifi Yayınla"}
        </button>
      </div>
    </form>
  );
}
