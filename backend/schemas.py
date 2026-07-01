from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Literal, Optional


# --- Nested recipe content ---

class IngredientItem(BaseModel):
    name: str
    amount: Optional[str] = None
    unit: Optional[str] = None
    note: Optional[str] = None


class StepItem(BaseModel):
    step_number: int
    text: str


class LinkItem(BaseModel):
    type: Literal["youtube", "other"]
    url: str
    label: Optional[str] = None


class RecipeListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    description: str
    like_count: int
    author_name: str


# --- Category tree (self-referential, arbitrary depth) ---

class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    parent_id: Optional[int] = None


class CategoryNode(CategoryOut):
    children: list["CategoryNode"] = []
    recipes: list[RecipeListItem] = []


CategoryNode.model_rebuild()  # resolves the recursive self-reference above


class CategoryDetailOut(CategoryNode):
    # Only populated by GET /categories/{slug}: the chain from root down to
    # (but not including) this node, so the frontend can render a breadcrumb
    # without extra fetches.
    ancestors: list[CategoryOut] = []


# --- Recipe ---

class RecipeCreate(BaseModel):
    category_id: int
    title: str
    description: str = ""
    ingredients: list[IngredientItem] = []
    instructions: list[StepItem] = []
    links: list[LinkItem] = []
    # honeypot field: real users never fill this in; bots that fill every
    # field blindly will trip it. See MVP risk note in the plan re: open
    # POST /recipes without auth.
    website: Optional[str] = None


class RecipeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    ingredients: Optional[list[IngredientItem]] = None
    instructions: Optional[list[StepItem]] = None
    links: Optional[list[LinkItem]] = None


class RecipeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category_id: int
    slug: str
    title: str
    description: str
    ingredients: list[IngredientItem]
    instructions: list[StepItem]
    links: list[LinkItem]
    like_count: int
    created_at: datetime
    is_liked_by_me: bool = False
    is_favorited_by_me: bool = False


# --- Users / likes / favorites ---

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    display_name: str


class UserProfileOut(BaseModel):
    user: UserOut
    recipe_count: int
    like_count: int
    favorite_count: int


class ToggleResult(BaseModel):
    active: bool
    like_count: Optional[int] = None


# --- Search ---

class SearchResults(BaseModel):
    recipes: list[RecipeListItem]
    categories: list[CategoryOut]
