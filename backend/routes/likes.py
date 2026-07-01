from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from config import MOCK_USER_ID
from database import get_db
import models
import schemas

router = APIRouter(tags=["likes"])


@router.post("/recipes/{recipe_id}/like", response_model=schemas.ToggleResult)
def toggle_like(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Tarif bulunamadı")

    existing = (
        db.query(models.Like)
        .filter(models.Like.recipe_id == recipe_id, models.Like.user_id == MOCK_USER_ID)
        .first()
    )

    if existing:
        db.delete(existing)
        recipe.like_count = max(0, recipe.like_count - 1)
        active = False
    else:
        db.add(models.Like(recipe_id=recipe_id, user_id=MOCK_USER_ID))
        recipe.like_count += 1
        active = True

    db.commit()
    return schemas.ToggleResult(active=active, like_count=recipe.like_count)
