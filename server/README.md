# MPFSL API (`server/`)

Express 5 + MongoDB API for the MPFSL admin panel and public site.
Design: [documentation/backend-architecture.md](../documentation/backend-architecture.md) ·
Endpoints: [documentation/api.md](../documentation/api.md)

## What's built so far

| Phase | Status |
|---|---|
| 0–1 Foundation, login, sessions, admin user management | ✅ |
| 2 Media uploads to R2 | next |
| 3 News & gallery | |

Endpoints available now:

| Method | Path | Who |
|---|---|---|
| `GET` | `/api/health` | anyone |
| `POST` | `/api/auth/login` | anyone (rate-limited) |
| `POST` | `/api/auth/logout` | logged in |
| `GET` | `/api/auth/me` | logged in |
| `POST` | `/api/auth/change-password` | logged in |
| `GET` `POST` | `/api/admin/users` | admin |
| `PATCH` | `/api/admin/users/:id` | admin |
| `POST` | `/api/admin/users/:id/reset-password` | admin |

## Run it locally

Requirements: Node 22+, and a MongoDB **replica set** (transactions need one) — an Atlas dev
cluster is easiest.

```bash
# from the repo root (installs server + shared via npm workspaces)
npm install

cd server
cp .env.example .env        # then fill in MONGODB_URI and SESSION_SECRET
npm run dev                 # http://localhost:8080/api/health
```

Create the first admin (prints a temporary password, changed at first login):

```bash
npm run create-admin -- --email you@example.com --name "Your Name"
```

## Tests

```bash
npm test          # all tests (in-memory MongoDB, no setup needed)
npm run test:watch
npm run lint
```

The first test run downloads a MongoDB binary (~80 MB) into `node_modules/.cache`.

## Folder layout

```
src/
├── index.js            # start server, graceful shutdown
├── app.js              # Express app (used by tests too)
├── routes.js           # mounts every module under /api
├── config/env.js       # validated environment variables
├── lib/                # db, logger, errors, passwords
├── middleware/         # security (helmet/cors/origin), session, requireAuth, validate, rate limits, errors
└── modules/
    ├── auth/           # login, logout, me, change password, sessions
    ├── users/          # User model + admin user management
    ├── audit/          # audit log
    └── health/
```
