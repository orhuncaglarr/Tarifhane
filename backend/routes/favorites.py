from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from config import MOCK_USER_ID
from database import get_db
import models
import schemas

router = APIRouter(tags=["favorites"])


@router.post("/recipes/{recipe_id}/favorite", response_model=schemas.ToggleResult)
def toggle_favorite(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Tarif bulunamadı")

    existing = (
        db.query(models.Favorite)
        .filter(models.Favorite.recipe_id == recipe_id, models.Favorite.user_id == MOCK_USER_ID)
        .first()
    )

    if existing:
        db.delete(existing)
        active = False
    else:
        db.add(models.Favorite(recipe_id=recipe_id, user_id=MOCK_USER_ID))
        active = True

    db.commit()
    return schemas.ToggleResult(active=active)
