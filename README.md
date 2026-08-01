# ClipNest Collections

## Project Name

ClipNest Collections

## What it does

ClipNest Collections is a product preview and prototype for organizing short-form video sources into collections. The current repository includes a public marketing and explore experience, a protected dashboard-style frontend that runs on mock data, and a small FastAPI backend service with health endpoints and shared utility modules.

## Why it exists

The project explores a product concept focused on curated, algorithm-free viewing. It gives shape to the information architecture, routing, and UI patterns for managing followed pages, tags, collections, and video feeds.

## Features

- Public landing page and collection exploration pages
- Collection detail pages with source and video previews
- Protected dashboard routes behind a mock login flow
- In-memory CRUD-style interactions for collections, pages, and tags in the frontend state
- Filtering by search, collection, tag, and platform in the dashboard
- Minimal FastAPI backend with `/` and `/health`
- Full backend API for pages, collections, tags, and videos with zero-infra local storage
- Server-side reel/short-video collector plus a developer-run Chrome extension
- Backend utility modules for env config parsing, logging, storage helpers, and LiteLLM-based generation helpers

## How it works

- `frontend/src/App.tsx` defines public and protected routes using React Router.
- `frontend/src/contexts/AuthContext.tsx` simulates authentication and accepts any credentials.
- `frontend/src/contexts/DataContext.tsx` seeds the UI with mock pages, collections, tags, and videos, then updates them in React state.
- `frontend/src/data/mockData.ts` is the current source of truth for demo content.
- `backend/main.py` starts a FastAPI app that mounts the ClipNest API (`api_collections.py`) and seeds demo content on startup.
- `backend/vtstorage/local_store.py` is a zero-infrastructure SQLite document store (no MongoDB required); the frontend hydrates from `GET /api/bootstrap` and writes through the CRUD endpoints, falling back to in-memory mock data when the API is offline.
- `backend/collector.py` collects public short videos with no API keys via public oEmbed (YouTube, TikTok) and Open Graph tags (Instagram, Facebook), exposed at `POST /api/collect/page`; the browser extension posts already-extracted reels to `POST /api/collect/videos`.

## Reel collector

Two ways to collect reels/shorts from public pages into ClipNest:

1. **In-app / server-side** — paste a public YouTube Shorts, TikTok, Instagram reel, or Facebook URL into the "Collect reels" bar on the Pages screen (calls `POST /api/collect/page`).
2. **Browser extension** — load `extension/` unpacked in Chrome (Developer mode → Load unpacked). It scans the page you're viewing for reel/short links and sends them to the API. See `extension/README.md`.

Set an optional `INGEST_API_KEY` in `backend/.env` to require an `X-API-Key` header on the collector endpoints.

## Tech stack

- Frontend: React 18, TypeScript, Vite 5, Tailwind CSS 3, shadcn-style UI components, React Query, React Router 6
- Backend: FastAPI, uvicorn, python-dotenv
- Additional backend utility code imports LiteLLM and Mongo-related helpers, but the current dependency files are not fully aligned with those imports

## Project structure

```text
backend/
├── main.py
├── api_shared.py
├── vtconf.d/
├── vtlib/       # generation helpers
├── vtstorage/   # storage helpers
└── vtutils/     # config, logging, misc utilities
frontend/
├── src/
│   ├── contexts/
│   ├── data/mockData.ts
│   ├── pages/
│   └── App.tsx
├── package.json
└── vite.config.ts
```

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server is configured for port `5301`.

### Backend

```bash
cd backend
python3 -m venv .venv
. .venv/bin/activate
pip install -r _ops/pip/requirements.in
python main.py
```

The backend defaults to port `5201`. It persists to a local SQLite file at `backend/data/clipnest.sqlite` — no MongoDB needed.

The frontend reads `VITE_API_BASE` (default `http://localhost:5201`, see `frontend/.env`) and works against the live API, gracefully falling back to bundled mock data if the backend is not running.

## Configuration

Backend configuration is loaded from `backend/.env` through `vtutils.confparser.env_config()`.

Variables referenced in code include:

- `VT_ENV`
- `APP_HOST`
- `APP_PORT`
- `OPENAI_APIKEY`
- `GOOGLE_GENAI_APIKEY`
- `ANTHROPIC_API_KEY`
- `VERTEXAI_APIKEY`
- `json_GOOGLE_SA` (parsed into `GOOGLE_SA` by the config loader)

No custom frontend environment variables are referenced in the current frontend source.

## Usage

1. Open the public landing page or explore pages.
2. Use any email/password in the mock login form to access protected routes.
3. Browse the dashboard, feed, collections, pages, tags, and profile views.
4. Create, edit, or delete demo collections and related records in the current browser session.

The current frontend data is in-memory only and resets when the app reloads.

## Development

Useful commands:

```bash
cd frontend && npm run dev
cd frontend && npm run build
cd backend && python main.py
```

Notes:

- The frontend currently does not call application CRUD endpoints from the backend.
- Most user-facing behavior is driven by `frontend/src/data/mockData.ts` and the React contexts.
- The backend is currently best described as a service scaffold plus shared utility code.

## Roadmap

There is no formal public roadmap documented in this repository yet. The current codebase is best treated as a prototype for the frontend experience plus an early backend scaffold.

## Contributing

Contributions are welcome. Please review [CONTRIBUTING.md](./CONTRIBUTING.md) and [public.md](./public.md) before opening a pull request.

## License

This project is available under the [MIT License](./LICENSE).
