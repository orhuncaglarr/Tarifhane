import type {
  Category,
  CategoryDetail,
  CategoryNode,
  Recipe,
  RecipeCreateInput,
  RecipeListItem,
  SearchResults,
  ToggleResult,
  UserProfile,
} from "./types";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function createApiClient(baseUrl: string) {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new ApiError(res.status, body || res.statusText);
    }
    return res.json() as Promise<T>;
  }

  return {
    getCategories: () => request<Category[]>("/categories"),
    getCategory: (slug: string) => request<CategoryDetail>(`/categories/${slug}`),
    getCategoryTree: () => request<CategoryNode[]>("/categories/tree"),
    getRecipe: (slugOrId: string | number) => request<Recipe>(`/recipes/${slugOrId}`),
    createRecipe: (payload: RecipeCreateInput) =>
      request<Recipe>("/recipes", { method: "POST", body: JSON.stringify(payload) }),
    toggleLike: (recipeId: number) =>
      request<ToggleResult>(`/recipes/${recipeId}/like`, { method: "POST" }),
    toggleFavorite: (recipeId: number) =>
      request<ToggleResult>(`/recipes/${recipeId}/favorite`, { method: "POST" }),
    search: (q: string) => request<SearchResults>(`/search?q=${encodeURIComponent(q)}`),
    getMyProfile: () => request<UserProfile>("/users/me"),
    getMyRecipes: () => request<RecipeListItem[]>("/users/me/recipes"),
    getMyLikes: () => request<RecipeListItem[]>("/users/me/likes"),
    getMyFavorites: () => request<RecipeListItem[]>("/users/me/favorites"),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
