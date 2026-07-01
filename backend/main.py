from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routes import categories, recipes, likes, favorites, search, users

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Tarifhane API",
    description="Türkçe yemek tarifleri veritabanı için API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # Next.js dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories.router)
app.include_router(recipes.router)
app.include_router(likes.router)
app.include_router(favorites.router)
app.include_router(search.router)
app.include_router(users.router)


@app.get("/")
def root():
    return {"message": "Tarifhane API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}
