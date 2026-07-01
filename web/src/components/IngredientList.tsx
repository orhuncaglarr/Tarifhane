"use client";

import { useState } from "react";
import type { IngredientItem } from "@tarifhane/shared";
import {
  convertIngredient,
  formatIngredientLine,
  type MeasurementSystem,
} from "@/lib/measurements";

export default function IngredientList({ ingredients }: { ingredients: IngredientItem[] }) {
  const [system, setSystem] = useState<MeasurementSystem>("metric");

  const displayIngredients = ingredients.map((ingredient) =>
    convertIngredient(ingredient, system),
  );

  return (
    <section className="recipe-section">
      <div className="recipe-section__head">
        <h2>Malzemeler</h2>
        <div className="unit-toggle" role="group" aria-label="Ölçü birimi">
          <button
            type="button"
            className={`unit-toggle__btn${system === "metric" ? " active" : ""}`}
            onClick={() => setSystem("metric")}
            aria-pressed={system === "metric"}
          >
            Metrik
          </button>
          <button
            type="button"
            className={`unit-toggle__btn${system === "imperial" ? " active" : ""}`}
            onClick={() => setSystem("imperial")}
            aria-pressed={system === "imperial"}
          >
            Imperial
          </button>
        </div>
      </div>
      <ul>
        {displayIngredients.map((ingredient, index) => (
          <li key={`${ingredient.name}-${index}`}>{formatIngredientLine(ingredient)}</li>
        ))}
      </ul>
    </section>
  );
}
