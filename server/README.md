# MPFSL API (`server/`)

Express 5 + MongoDB API for the MPFSL admin panel and public site.
Design: [documentation/backend-architecture.md](../documentation/backend-architecture.md) ·
Endpoints: [documentation/api.md](../documentation/api.md)

## What's built so far

| Phase | Status |
|---|---|
| 0–1 Foundation, login, sessions, admin user management | ✅ |
| 2 Media uploads (R2, or a local folder in development) | ✅ |
| 3 Gallery | ✅ |
| 3 News | ✅ |

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
| `GET` | `/api/news` | anyone |
| `GET` | `/api/site-photos` | anyone |
| `GET` `POST` | `/api/admin/media` | editor, admin |
| `PATCH` `DELETE` | `/api/admin/media/:id` | editor, admin |
| `GET` `POST` | `/api/admin/news` | editor, admin |
| `PUT` | `/api/admin/news/order` | editor, admin |
| `GET` `PUT` `DELETE` | `/api/admin/news/:id` | editor, admin |
| `PUT` | `/api/admin/news/:id/status` | editor, admin |
| `POST` | `/api/admin/news/:id/feature` | editor, admin |
| `GET` | `/api/admin/site-photos` | editor, admin |
| `PUT` `DELETE` | `/api/admin/site-photos/:key` | editor, admin |

**Photo storage:** while any of the five R2 settings in `.env` is empty, uploads are saved in
`server/.data/uploads` (git-ignored) and served by the API at `/api/uploads/...`. Fill in all five
and new uploads go to the R2 bucket instead. Production starts without R2, but uploads are turned
off (`503 STORAGE_NOT_CONFIGURED`) until all five are set.

## Run it locally

Requirements: Node 22+ and MongoDB — your own local install is fine (standalone works in development;
multi-step changes just run without transactions). Production uses MongoDB Atlas.

```bash
# from the repo root, once (installs server + shared + Frontend-v2 via npm workspaces)
npm install
cp server/.env.example server/.env
# then set SESSION_SECRET in server/.env (generate one with:
#   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))" )
# and MONGODB_URI=mongodb://127.0.0.1:27017/mpfsl-dev (your MongoDB)

npm run init -- --email you@example.com --name "Your Name"   # once: indexes + your admin account

# every time — two terminals:
npm run dev:server          # API → http://localhost:8080/api/health
npm run dev:web             # site → http://localhost:5180, admin → http://admin.localhost:5180
```

### Optional: real transactions locally

Not needed for development. If you want your local MongoDB to behave exactly like production
(transactions on), either run `npm run dev:db` (private replica set on port 27018, use
`mongodb://127.0.0.1:27018/mpfsl-dev?replicaSet=rs0`), or turn your MongoDB into a single-node replica
set once. In an **Administrator** PowerShell:

1. Edit `C:\Program Files\MongoDB\Server\<version>\bin\mongod.cfg` and add:
   ```yaml
   replication:
     replSetName: rs0
   ```
2. `Restart-Service MongoDB`
3. `mongosh --eval "rs.initiate({_id:'rs0', members:[{_id:0, host:'127.0.0.1:27017'}]})"`

Then use `MONGODB_URI=mongodb://127.0.0.1:27017/mpfsl-dev?replicaSet=rs0` and run `npm run init`.

### First-time setup of a database: `npm run init`

Run once for every new database (your machine, staging, production). Safe to re-run anytime.

```bash
npm run init -- --email you@example.com --name "Your Name"
```

It (1) checks the database is reachable and supports transactions, (2) creates all indexes
(unique emails, expiring sessions…), and (3) creates the first admin with a temporary password —
only if no active admin exists yet, and (4) copies the website's built-in news stories into the
database if it has none (after that, news is edited in the admin panel). Those stories first use
the photos that ship with the website; once R2 is set up, `npm run upload-news-photos` moves them
into the bucket (safe to re-run). Instead of the flags you can set `INITIAL_ADMIN_EMAIL` and
`INITIAL_ADMIN_NAME`.

In production the API does **not** build indexes on startup, so `npm run init` is required there
(and again after deploys that add new models/indexes).

To add more admins later, use the admin panel's Users page, or:
`npm run create-admin -- --email someone@example.com --name "Name"`.

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
