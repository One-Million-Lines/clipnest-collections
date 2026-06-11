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
- Backend utility modules for env config parsing, logging, storage helpers, and LiteLLM-based generation helpers

## How it works

- `frontend/src/App.tsx` defines public and protected routes using React Router.
- `frontend/src/contexts/AuthContext.tsx` simulates authentication and accepts any credentials.
- `frontend/src/contexts/DataContext.tsx` seeds the UI with mock pages, collections, tags, and videos, then updates them in React state.
- `frontend/src/data/mockData.ts` is the current source of truth for demo content.
- `backend/main.py` starts a FastAPI app with CORS for the local frontend and exposes only service-status endpoints.
- `backend/vtutils/confparser.py` loads backend env config, while `backend/vtlib/` and `backend/vtstorage/` contain shared helper code that is not yet wired into public API routes in this repository.

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

The backend defaults to port `5201`.

Note: `_ops/pip/requirements.txt` is currently empty, and `_ops/pip/requirements.in` only lists base FastAPI dependencies. The backend code imports additional packages such as LiteLLM and PyMongo helpers, so backend work may require completing the dependency list first.

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
