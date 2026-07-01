import type { IngredientItem } from "@tarifhane/shared";

export type MeasurementSystem = "metric" | "imperial";

type BaseAmount = { kind: "mass"; value: number } | { kind: "volume"; value: number };

const MASS_TO_G: Record<string, number> = {
  g: 1,
  gr: 1,
  gram: 1,
  kg: 1000,
  kilogram: 1000,
  kilo: 1000,
  oz: 28.3495,
  ounce: 28.3495,
  lb: 453.592,
  lbs: 453.592,
  pound: 453.592,
};

const VOLUME_TO_ML: Record<string, number> = {
  ml: 1,
  mililitre: 1,
  mililiter: 1,
  l: 1000,
  lt: 1000,
  litre: 1000,
  liter: 1000,
  "su bardağı": 200,
  "su bardagi": 200,
  "çay bardağı": 100,
  "cay bardagi": 100,
  "yemek kaşığı": 15,
  "yemek kasigi": 15,
  yk: 15,
  tbsp: 15,
  tablespoon: 15,
  "tatlı kaşığı": 5,
  "tatli kasigi": 5,
  "çay kaşığı": 5,
  "cay kasigi": 5,
  tk: 5,
  tsp: 5,
  teaspoon: 5,
  cup: 240,
  "fl oz": 29.5735,
};

const COUNT_UNITS = new Set([
  "adet",
  "tane",
  "piece",
  "pieces",
  "clove",
  "diş",
  "dis",
  "demet",
  "tutam",
  "pinch",
]);

function normalizeUnit(unit: string): string {
  return unit.trim().toLocaleLowerCase("tr");
}

export function parseAmount(amount: string | null | undefined): number | null {
  if (!amount?.trim()) return null;

  const cleaned = amount.trim().replace(",", ".");
  const mixed = cleaned.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  }

  const fraction = cleaned.match(/^(\d+)\/(\d+)$/);
  if (fraction) {
    return Number(fraction[1]) / Number(fraction[2]);
  }

  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

function toBase(amount: number, unit: string): BaseAmount | null {
  const key = normalizeUnit(unit);
  if (COUNT_UNITS.has(key)) return null;

  const massFactor = MASS_TO_G[key];
  if (massFactor) return { kind: "mass", value: amount * massFactor };

  const volumeFactor = VOLUME_TO_ML[key];
  if (volumeFactor) return { kind: "volume", value: amount * volumeFactor };

  return null;
}

function formatAmount(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  const whole = Math.floor(rounded);
  const frac = rounded - whole;

  if (frac < 0.08) return String(whole);
  if (frac > 0.92) return String(whole + 1);

  const fractions: [number, string][] = [
    [0.25, "¼"],
    [0.33, "⅓"],
    [0.5, "½"],
    [0.67, "⅔"],
    [0.75, "¾"],
  ];

  for (const [target, symbol] of fractions) {
    if (Math.abs(frac - target) < 0.08) {
      return whole > 0 ? `${whole} ${symbol}` : symbol;
    }
  }

  return String(rounded);
}

function formatMetric(base: BaseAmount): { amount: string; unit: string } {
  if (base.kind === "mass") {
    if (base.value >= 1000) {
      return { amount: formatAmount(base.value / 1000), unit: "kg" };
    }
    return { amount: formatAmount(base.value), unit: "g" };
  }

  if (base.value >= 1000) {
    return { amount: formatAmount(base.value / 1000), unit: "L" };
  }
  return { amount: formatAmount(base.value), unit: "ml" };
}

function formatImperial(base: BaseAmount): { amount: string; unit: string } {
  if (base.kind === "mass") {
    const oz = base.value / 28.3495;
    if (oz >= 16) {
      return { amount: formatAmount(oz / 16), unit: "lb" };
    }
    return { amount: formatAmount(oz), unit: "oz" };
  }

  const ml = base.value;
  const cupMl = 240;
  const tbspMl = 15;
  const tspMl = 5;

  if (ml >= cupMl * 0.2) {
    return { amount: formatAmount(ml / cupMl), unit: "cup" };
  }
  if (ml >= tbspMl) {
    return { amount: formatAmount(ml / tbspMl), unit: "tbsp" };
  }
  if (ml >= tspMl) {
    return { amount: formatAmount(ml / tspMl), unit: "tsp" };
  }
  return { amount: formatAmount(ml / 29.5735), unit: "fl oz" };
}

export function convertIngredient(
  ingredient: IngredientItem,
  system: MeasurementSystem,
): IngredientItem {
  const amount = parseAmount(ingredient.amount);
  const unit = ingredient.unit?.trim() ?? "";

  if (amount === null || !unit) return ingredient;

  const key = normalizeUnit(unit);
  if (COUNT_UNITS.has(key)) return ingredient;

  const base = toBase(amount, unit);
  if (!base) return ingredient;

  const converted = system === "metric" ? formatMetric(base) : formatImperial(base);
  return {
    ...ingredient,
    amount: converted.amount,
    unit: converted.unit,
  };
}

export function formatIngredientLine(ingredient: IngredientItem): string {
  const parts = [ingredient.amount, ingredient.unit, ingredient.name].filter(Boolean);
  const line = parts.join(" ");
  return ingredient.note ? `${line} (${ingredient.note})` : line;
}
