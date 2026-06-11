# Contributing

Thanks for your interest in improving ClipNest Collections.

## Before you start

- Read [public.md](./public.md).
- Keep the README honest about the current state of the repo: mock-data frontend, minimal backend endpoints, and utility code under active evolution.
- Prefer small, focused pull requests.

## Local setup

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
python3 -m venv .venv
. .venv/bin/activate
pip install -r _ops/pip/requirements.in
python main.py
```

## Development guidelines

- Document any new runtime dependencies, especially for backend helper modules.
- Do not present mock-data behavior as production-ready functionality.
- Do not commit `.env` files, local builds, or generated cache files.
- Update `README.md` and `.env.example` when routes, config, or setup requirements change.

## Pull request checklist

- [ ] The change matches actual repository behavior
- [ ] Setup instructions still reflect the current code
- [ ] No secrets, env files, or generated assets are included
- [ ] Prototype limitations are documented clearly when relevant
