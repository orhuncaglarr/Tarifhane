from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from config import MOCK_USER_ID
from database import get_db
import models
import schemas
from slugify import unique_slug

router = APIRouter(prefix="/recipes", tags=["recipes"])


def _to_recipe_out(db: Session, recipe: models.Recipe) -> schemas.RecipeOut:
    out = schemas.RecipeOut.model_validate(recipe)
    out.is_liked_by_me = (
        db.query(models.Like)
        .filter(models.Like.recipe_id == recipe.id, models.Like.user_id == MOCK_USER_ID)
        .first()
        is not None
    )
    out.is_favorited_by_me = (
        db.query(models.Favorite)
        .filter(models.Favorite.recipe_id == recipe.id, models.Favorite.user_id == MOCK_USER_ID)
        .first()
        is not None
    )
    return out


def _find_recipe(db: Session, slug_or_id: str) -> models.Recipe:
    recipe = db.query(models.Recipe).filter(models.Recipe.slug == slug_or_id).first()
    if not recipe and slug_or_id.isdigit():
        recipe = db.query(models.Recipe).filter(models.Recipe.id == int(slug_or_id)).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Tarif bulunamadı")
    return recipe


@router.get("/{slug_or_id}", response_model=schemas.RecipeOut)
def get_recipe(slug_or_id: str, db: Session = Depends(get_db)):
    recipe = _find_recipe(db, slug_or_id)
    return _to_recipe_out(db, recipe)


@router.post("", response_model=schemas.RecipeOut)
def create_recipe(payload: schemas.RecipeCreate, db: Session = Depends(get_db)):
    # Honeypot: real users never fill this hidden field in; bots that fill
    # every field blindly will trip it. Respond as if it succeeded (without
    # touching the database) so bots don't learn to leave it blank.
    if payload.website:
        return JSONResponse(status_code=201, content={
            "id": 0, "category_id": payload.category_id, "slug": "",
            "title": payload.title, "description": payload.description,
            "ingredients": [i.model_dump() for i in payload.ingredients],
            "instructions": [s.model_dump() for s in payload.instructions],
            "links": [l.model_dump() for l in payload.links], "like_count": 0,
            "created_at": datetime.utcnow().isoformat(),
            "is_liked_by_me": False, "is_favorited_by_me": False,
        })

    category = (
        db.query(models.Category)
        .filter(models.Category.id == payload.category_id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=400, detail="Geçersiz kategori")

    slug = unique_slug(
        payload.title,
        lambda candidate: db.query(models.Recipe).filter(models.Recipe.slug == candidate).first()
        is not None,
    )

    recipe = models.Recipe(
        category_id=payload.category_id,
        title=payload.title,
        slug=slug,
        description=payload.description,
        ingredients=[i.model_dump() for i in payload.ingredients],
        instructions=[s.model_dump() for s in payload.instructions],
        links=[l.model_dump() for l in payload.links],
        created_by_user_id=MOCK_USER_ID,
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return _to_recipe_out(db, recipe)


@router.put("/{recipe_id}", response_model=schemas.RecipeOut)
def update_recipe(recipe_id: int, payload: schemas.RecipeUpdate, db: Session = Depends(get_db)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Tarif bulunamadı")

    update_data = payload.model_dump(exclude_unset=True)
    for field in ("ingredients", "instructions", "links"):
        if field in update_data and update_data[field] is not None:
            update_data[field] = [item for item in update_data[field]]
    for key, value in update_data.items():
        setattr(recipe, key, value)

    db.commit()
    db.refresh(recipe)
    return _to_recipe_out(db, recipe)
