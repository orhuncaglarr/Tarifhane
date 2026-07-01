from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    display_name = Column(String(255), nullable=False)
    is_mock = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    recipes = relationship("Recipe", back_populates="created_by")
    likes = relationship("Like", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")


class Category(Base):
    """Self-referential taxonomy node (adjacency list). A category can nest to
    any depth (Ana Yemekler -> Et Yemekleri -> Köfteler -> ...); recipes attach
    to whichever node ends up being the leaf for a given branch, not a fixed
    level number.
    """

    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)
    name = Column(String(255), nullable=False)
    # Slug is globally unique (not just per-parent) so any node can be looked
    # up directly via GET /categories/{slug} regardless of its depth, without
    # needing the full ancestor path in the URL.
    slug = Column(String(255), unique=True, nullable=False, index=True)

    # remote_side=[id] tells SQLAlchemy which side of the self-join is the
    # "one" (parent) - required for adjacency-list self-referential relationships.
    parent = relationship("Category", remote_side=[id], back_populates="children")
    children = relationship(
        "Category", back_populates="parent", cascade="all, delete-orphan"
    )
    recipes = relationship(
        "Recipe", back_populates="category", cascade="all, delete-orphan"
    )
    # NOTE: cascade="all, delete-orphan" above only fires on ORM-level deletes
    # (session.delete(category)), which walks the loaded children/recipes
    # relationships recursively. A bulk `Query.delete()` would bypass this and
    # orphan rows - there's no category-delete endpoint today, so this is just
    # a guardrail for whoever adds one later.


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, default="")

    # Ordered nested data - lists of small dicts. These stay JSON rather than
    # normalized tables because they're recipe-scoped and never queried
    # independently (the Category tree is the level that needs relational
    # querying and sorting).
    # ingredients: [{name, amount, unit, note}]
    ingredients = Column(JSON, default=list)
    # instructions: [{step_number, text}]
    instructions = Column(JSON, default=list)
    # links: [{type: "youtube" | "other", url, label}]
    links = Column(JSON, default=list)

    like_count = Column(Integer, default=0, nullable=False)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="recipes")
    created_by = relationship("User", back_populates="recipes")
    likes = relationship("Like", back_populates="recipe", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="recipe", cascade="all, delete-orphan")


class Like(Base):
    __tablename__ = "likes"
    __table_args__ = (
        UniqueConstraint("user_id", "recipe_id", name="uq_like_user_recipe"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="likes")
    recipe = relationship("Recipe", back_populates="likes")


class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint("user_id", "recipe_id", name="uq_favorite_user_recipe"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="favorites")
    recipe = relationship("Recipe", back_populates="favorites")
