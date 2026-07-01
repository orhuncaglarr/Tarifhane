from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from database import get_db
import models
import schemas
from turkish_sort import turkish_sort_key

router = APIRouter(prefix="/categories", tags=["categories"])


def _load_recipes(db: Session) -> list[models.Recipe]:
    return (
        db.query(models.Recipe)
        .options(joinedload(models.Recipe.created_by))
        .all()
    )


def _group_recipes_by_category(recipes: list[models.Recipe]) -> dict[int, list[models.Recipe]]:
    grouped: dict[int, list[models.Recipe]] = {}
    for recipe in recipes:
        grouped.setdefault(recipe.category_id, []).append(recipe)
    return grouped


def _build_tree(
    all_categories: list[models.Category],
    recipes_by_category: dict[int, list[models.Recipe]],
    parent_id: int | None,
) -> list[schemas.CategoryNode]:
    children = [c for c in all_categories if c.parent_id == parent_id]
    children.sort(key=lambda c: turkish_sort_key(c.name))

    return [
        schemas.CategoryNode(
            id=c.id,
            name=c.name,
            slug=c.slug,
            parent_id=c.parent_id,
            children=_build_tree(all_categories, recipes_by_category, c.id),
            recipes=sorted(
                [schemas.RecipeListItem.model_validate(r) for r in recipes_by_category.get(c.id, [])],
                key=lambda r: turkish_sort_key(r.title),
            ),
        )
        for c in children
    ]


@router.get("", response_model=list[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(models.Category).all()
    return sorted(categories, key=lambda c: turkish_sort_key(c.name))


@router.get("/tree", response_model=list[schemas.CategoryNode])
def get_category_tree(db: Session = Depends(get_db)):
    all_categories = db.query(models.Category).all()
    all_recipes = _load_recipes(db)
    recipes_by_category = _group_recipes_by_category(all_recipes)
    return _build_tree(all_categories, recipes_by_category, parent_id=None)


@router.get("/{slug}", response_model=schemas.CategoryDetailOut)
def get_category(slug: str, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.slug == slug).first()
    if not category:
        raise HTTPException(status_code=404, detail="Kategori bulunamadı")

    all_categories = db.query(models.Category).all()
    all_recipes = _load_recipes(db)
    recipes_by_category = _group_recipes_by_category(all_recipes)
    by_id = {c.id: c for c in all_categories}

    ancestors: list[schemas.CategoryOut] = []
    walker = category
    while walker.parent_id is not None:
        walker = by_id[walker.parent_id]
        ancestors.insert(0, schemas.CategoryOut.model_validate(walker))

    return schemas.CategoryDetailOut(
        id=category.id,
        name=category.name,
        slug=category.slug,
        parent_id=category.parent_id,
        children=_build_tree(all_categories, recipes_by_category, parent_id=category.id),
        recipes=sorted(
            [schemas.RecipeListItem.model_validate(r) for r in recipes_by_category.get(category.id, [])],
            key=lambda r: turkish_sort_key(r.title),
        ),
        ancestors=ancestors,
    )
