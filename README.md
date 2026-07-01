# Tarifhane

Türkçe yemek tarifleri veritabanı (Turkish recipe database) website. Public,
ad-supported recipe site with a browsable category tree (arbitrary depth,
e.g. Ana Yemekler → Et Yemekleri → Köfteler → recipes), search, recipe
submission, and likes/favorites - all navigable from a single cascading
home page.

This README explains what each part of the code does and how to run it.

## Architecture

```
tarifhane/
├── backend/    FastAPI + SQLAlchemy + SQLite API (all data lives here)
├── shared/     @tarifhane/shared - TypeScript types + typed API client, used by web
└── web/        Next.js (App Router) website that talks to the backend
```

`web` and `backend` are two separate processes: `backend` is a Python API
server (default port 8000), `web` is a Node/Next.js server (default port
3000) that fetches data from `backend` over HTTP. Nothing is shared at the
database level - `web` never touches SQLite directly.

There is currently **no mobile app** - an earlier version of the plan
included an Expo/React Native app, but that was dropped to focus on the
website.

## Backend (`backend/`)

Python (FastAPI) service. Key files:

- `models.py` - `Category` is a **self-referential tree** (adjacency list:
  `parent_id` FK to another `Category`, `children`/`parent` relationships via
  SQLAlchemy's `remote_side=[id]`), so the taxonomy can nest to any depth
  (Ana Yemekler → Et Yemekleri → Köfteler → ...) instead of a fixed number of
  levels. `Recipe.category_id` attaches a recipe to whichever category node
  ends up being the leaf for its branch - any node can hold recipes directly,
  not just "the deepest possible" one. Also `User`, `Like`, `Favorite`. A
  recipe's `ingredients`, `instructions`, and `links` are stored as ordered
  JSON arrays on the `Recipe` row itself (not separate tables), since they're
  recipe-scoped and never queried independently.
- `schemas.py` - Pydantic request/response shapes, including the recursive
  `CategoryNode` (`children: list[CategoryNode]` + `recipes`) used by the
  tree endpoint below.
- `turkish_sort.py` - Turkish-alphabet-aware sorting and case-folding.
  SQLite's built-in collation/`LIKE` only understands ASCII case-folding, so
  Ç/Ğ/I/İ/Ö/Ş/Ü would sort and search incorrectly if left to SQL. This module
  implements Turkish sort order and casing in Python instead, and is used
  everywhere categories/recipes are ordered or searched (`routes/categories.py`,
  `routes/search.py`) - at every depth of the tree.
- `slugify.py` - turns Turkish titles into URL slugs (`Ezogelin Çorbası` →
  `ezogelin-corbasi`), with automatic `-2`, `-3`, ... suffixes on collision.
  Category slugs are globally unique (not just per-parent), so any node can
  be looked up directly via `GET /categories/{slug}` regardless of depth.
- `seed.py` - populates the database with a sample category tree (deliberately
  spanning the full Turkish alphabet, to make sorting bugs visible, and
  including a 4-level branch - Ana Yemekler → Et Yemekleri → Köfteler → İnegöl
  Köfte - to exercise arbitrary-depth nesting) plus the one mock user every
  like/favorite/submission is attributed to for now (see **Accounts** below).
  The `DATA` structure is itself a recursive tree (`name` + optional
  `children`/`recipes` keys), inserted via a recursive `insert_node()`.
- `routes/` - one file per resource: `categories` (includes `GET /categories/tree`,
  returning the whole nested tree in one response), `recipes`, `likes`,
  `favorites`, `search`, `users`.

### Accounts (important limitation)

There is no login. Every recipe submission, like, and favorite is attributed
to a single seeded "mock" user (`Misafir Şef`). This was a deliberate MVP
choice: building believable per-visitor identity (real accounts or per-device
anonymous IDs) was pushed to a later phase, and until it exists, sorting
recipes by "most liked" wouldn't mean much (there's no real per-visitor like
data yet) - so recipe lists sort alphabetically, same as categories at every
depth, instead of by like count.

`POST /recipes` also has no auth, which means it's an open write endpoint on
a public site. There's a honeypot field (`website`) as a minimal anti-spam
measure, but real IP rate-limiting is not implemented yet - worth adding
before a real public launch.

### Running the backend

```sh
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed.py          # (re)creates tarifhane.db with sample data
uvicorn main:app --reload --port 8000
```

Then open `http://localhost:8000/docs` for interactive API docs (Swagger
UI), or just hit endpoints directly, e.g. `curl http://localhost:8000/categories`.

Running `seed.py` again drops and recreates all tables - use it any time you
want a clean slate.

## Shared package (`shared/`)

`@tarifhane/shared` is an npm workspace package with no build step (consumed
as raw TypeScript via `transpilePackages` in `web/next.config.ts`).

- `src/types.ts` - TypeScript interfaces mirroring `backend/schemas.py` by
  hand (kept in sync manually - there's no code generation from the OpenAPI
  schema yet), including the recursive `CategoryNode`/`CategoryDetail`.
- `src/api.ts` - `createApiClient(baseUrl)` returns a typed fetch client
  (`getCategoryTree`, `getCategory`, `getRecipe`, `createRecipe`, `toggleLike`,
  `search`, ...). Each consumer supplies its own `baseUrl` via an env var.

## Web (`web/`)

Next.js 16 (App Router, TypeScript). Chosen over a plain client-side SPA
specifically because this is a content site that needs organic search
traffic for ad revenue to make sense - Next.js gives server rendering,
per-page `<title>`/meta tags, and a generated sitemap for free.

Browsing is a **single cascading page** rather than one page per taxonomy
level: the whole category tree is fetched once and rendered as nested,
expandable branches (native `<details>/<summary>`, no client JS required for
expand/collapse - the full tree is present in the server-rendered HTML
regardless of which branches are visually collapsed, so it stays fully
crawlable/SEO-friendly). There is deliberately no separate page per category
or subcategory anymore.

Pages (all under `src/app/`):

- `/` - home page: search bar + the full category tree (`<CategoryTree>`),
  top level pre-expanded, deeper levels collapsed by default. Each node has
  an anchor id (`#cat-{slug}`) so other pages can link/scroll straight into
  it (browsers natively auto-open a closed `<details>` when its content is
  the target of a same-page fragment link).
- `/tarif/[recipeSlug]` - recipe detail: ingredients, numbered steps, embedded
  YouTube video (or plain link) for each attached link, like/favorite
  buttons. The only "deep content" page - too much to inline in the tree.
- `/tarif/yeni` - recipe submission form. The category picker is a chain of
  `<select>`s that grows one level at a time as you drill down (mirrors
  whatever depth the tree actually has for that branch) rather than a fixed
  two-level dropdown. Not indexed by search engines (`robots: noindex`).
- `/profil` - the (single, mock) user's submitted recipes / likes /
  favorites, as tabs. Not indexed.
- `/ara` - search results page: matching categories (as `#cat-{slug}` links
  back into the home page tree) and matching recipes. Not indexed (query
  pages have no independent SEO value; the tree and recipe pages carry that
  weight).
- `sitemap.ts` / `robots.ts` - `sitemap.ts` recursively walks
  `getCategoryTree()` to list the homepage plus every recipe URL (no
  per-category URLs, since there's no separate page for them).

The recipe detail page uses `generateStaticParams` (recursively flattening
every node's recipes out of the tree), so `npm run build` pre-renders every
recipe page at build time and revalidates in the background afterwards (30s).
The home page itself revalidates every 60s.

Components (`src/components/`): `Header`/`Footer`, `SearchBar`,
`CategoryTree` (the recursive tree), `CategoryGrid`/`RecipeGrid` (still used
for flat lists, e.g. search results), `RecipeForm`, `LikeButton`/
`FavoriteButton` (optimistic UI - the heart/star flips immediately, then
reconciles with the server response), `AdSlot`.

### Ads (`AdSlot`)

`components/AdSlot.tsx` renders a real Google AdSense unit only when
`NEXT_PUBLIC_ADSENSE_CLIENT_ID` (and a slot id) are set as env vars;
otherwise it renders a fixed-size "Reklam alanı" placeholder box, so the
layout won't shift once ads are turned on. The `adsbygoogle.js` loader script
in `src/app/layout.tsx` is gated the same way.

**Getting an approved AdSense account and real ad unit IDs is a manual step
outside this codebase** - Google needs to review the live, deployed site
first. Once approved, set the env vars below and ads will start rendering
in place of the placeholders automatically - no code changes needed.

### Running the web app

Backend must be running first (see above), then:

```sh
cd web
npm install
npm run dev      # http://localhost:3000
```

Or from the repo root, `./dev.sh` starts both backend and web together.

Production build (also verifies static generation):

```sh
npm run build
npm run start
```

### Environment variables (`web/.env.local`, copy from `.env.local.example`)

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend URL the web app calls | `http://localhost:8000` |
| `NEXT_PUBLIC_SITE_URL` | Used for sitemap/robots/metadata absolute URLs | `http://localhost:3000` |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Your AdSense publisher id (`ca-pub-...`) | empty (ads off, placeholders shown) |
| `NEXT_PUBLIC_ADSENSE_SLOT_ID` | Your AdSense ad slot id | empty |

## Known limitations / natural next steps

- No real user accounts - everything is attributed to one mock user.
- Recipe lists sort alphabetically, not by likes, until real per-visitor
  identity exists (otherwise "most liked" is meaningless with one shared
  user).
- `POST /recipes` has no auth beyond a honeypot field - add rate-limiting
  before a real public launch.
- SQLite is fine for this scale; swapping to Postgres later is just a
  `DATABASE_URL` change (introduce Alembic migrations first, since the
  backend currently just does `Base.metadata.create_all`).
- No mobile app currently.
- Removing per-category pages (in favor of the single cascading tree) trades
  away some SEO surface - fewer indexable URLs than before. The `#cat-{slug}`
  anchors keep categories linkable/shareable, but if organic search traffic
  to specific categories matters later, a generic `/kategori/[slug]` page
  could be reintroduced cheaply (the backend's `GET /categories/{slug}`
  endpoint - single node + subtree + ancestors - already supports it).
