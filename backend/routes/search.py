from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from database import get_db
import models
import schemas
from turkish_sort import turkish_sort_key, turkish_casefold

router = APIRouter(tags=["search"])


@router.get("/search", response_model=schemas.SearchResults)
def search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    # SQLite's LIKE/ILIKE only case-folds ASCII, so a query like "corba"
    # won't match "Çorbası" in SQL. The dataset here is small (a recipe
    # site's taxonomy + recipes, not millions of rows), so it's cheap and
    # correct to fetch and filter with Turkish-aware casefolding in Python -
    # same approach as turkish_sort_key, and it stays correct after the
    # planned SQLite -> Postgres swap too.
    needle = turkish_casefold(q)

    all_recipes = (
        db.query(models.Recipe)
        .options(joinedload(models.Recipe.created_by))
        .all()
    )
    all_categories = db.query(models.Category).all()

    recipes = [r for r in all_recipes if needle in turkish_casefold(r.title)][:50]
    categories = [c for c in all_categories if needle in turkish_casefold(c.name)]

    return schemas.SearchResults(
        recipes=sorted(
            [schemas.RecipeListItem.model_validate(r) for r in recipes],
            key=lambda r: turkish_sort_key(r.title),
        ),
        categories=sorted(
            [schemas.CategoryOut.model_validate(c) for c in categories],
            key=lambda c: turkish_sort_key(c.name),
        ),
    )
