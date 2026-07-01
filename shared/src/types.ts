// Matching backend schemas (backend/schemas.py)

export interface IngredientItem {
  name: string;
  amount?: string | null;
  unit?: string | null;
  note?: string | null;
}

export interface StepItem {
  step_number: number;
  text: string;
}

export interface LinkItem {
  type: "youtube" | "other";
  url: string;
  label?: string | null;
}

export interface RecipeListItem {
  id: number;
  slug: string;
  title: string;
  description: string;
  like_count: number;
}

// Self-referential taxonomy node - a category can nest to any depth
// (Ana Yemekler -> Et Yemekleri -> Köfteler -> ...); recipes attach to
// whichever node is the leaf for a given branch, not a fixed level number.
export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
}

export interface CategoryNode extends Category {
  children: CategoryNode[];
  recipes: RecipeListItem[];
}

export interface CategoryDetail extends CategoryNode {
  // Chain from root down to (not including) this node, for breadcrumbs.
  ancestors: Category[];
}

export interface Recipe {
  id: number;
  category_id: number;
  slug: string;
  title: string;
  description: string;
  ingredients: IngredientItem[];
  instructions: StepItem[];
  links: LinkItem[];
  like_count: number;
  created_at: string;
  is_liked_by_me: boolean;
  is_favorited_by_me: boolean;
}

export interface RecipeCreateInput {
  category_id: number;
  title: string;
  description?: string;
  ingredients?: IngredientItem[];
  instructions?: StepItem[];
  links?: LinkItem[];
  // Honeypot field - must stay empty. Never render it visibly in real forms.
  website?: string;
}

export interface User {
  id: number;
  display_name: string;
}

export interface UserProfile {
  user: User;
  recipe_count: number;
  like_count: number;
  favorite_count: number;
}

export interface ToggleResult {
  active: boolean;
  like_count?: number | null;
}

export interface SearchResults {
  recipes: RecipeListItem[];
  categories: Category[];
}
