from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from config import MOCK_USER_ID
from database import get_db
import models
import schemas

router = APIRouter(prefix="/users", tags=["users"])


def _me(db: Session) -> models.User:
    user = db.query(models.User).filter(models.User.id == MOCK_USER_ID).first()
    if not user:
        raise HTTPException(status_code=500, detail="Mock kullanıcı bulunamadı - seed.py çalıştırıldı mı?")
    return user


@router.get("/me", response_model=schemas.UserProfileOut)
def get_me(db: Session = Depends(get_db)):
    user = _me(db)
    return schemas.UserProfileOut(
        user=schemas.UserOut.model_validate(user),
        recipe_count=db.query(models.Recipe).filter(models.Recipe.created_by_user_id == user.id).count(),
        like_count=db.query(models.Like).filter(models.Like.user_id == user.id).count(),
        favorite_count=db.query(models.Favorite).filter(models.Favorite.user_id == user.id).count(),
    )


@router.get("/me/recipes", response_model=list[schemas.RecipeListItem])
def get_my_recipes(db: Session = Depends(get_db)):
    user = _me(db)
    recipes = (
        db.query(models.Recipe)
        .filter(models.Recipe.created_by_user_id == user.id)
        .order_by(models.Recipe.created_at.desc())
        .all()
    )
    return recipes


@router.get("/me/likes", response_model=list[schemas.RecipeListItem])
def get_my_likes(db: Session = Depends(get_db)):
    user = _me(db)
    recipes = (
        db.query(models.Recipe)
        .join(models.Like, models.Like.recipe_id == models.Recipe.id)
        .filter(models.Like.user_id == user.id)
        .order_by(models.Like.created_at.desc())
        .all()
    )
    return recipes


@router.get("/me/favorites", response_model=list[schemas.RecipeListItem])
def get_my_favorites(db: Session = Depends(get_db)):
    user = _me(db)
    recipes = (
        db.query(models.Recipe)
        .join(models.Favorite, models.Favorite.recipe_id == models.Recipe.id)
        .filter(models.Favorite.user_id == user.id)
        .order_by(models.Favorite.created_at.desc())
        .all()
    )
    return recipes
