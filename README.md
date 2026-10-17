# MPFSL — Modern Pentathlon Federation of Sri Lanka website

The federation's public website, its staff admin panel, and the API behind them.

| Part | Folder | Address (production) | Address (your computer) |
|---|---|---|---|
| Public website | `Frontend-v2/` | `website.lk` | http://localhost:5180 |
| Admin panel (staff login) | `Frontend-v2/src/admin/` | `admin.website.lk` | http://admin.localhost:5180 |
| API (Express + MongoDB) | `server/` | `api.website.lk` | http://localhost:8080/api |
| Shared validation rules | `shared/` | — | — |

The public site and the admin panel are **one app**: it shows the admin panel when the address starts
with `admin.`. Plans and design decisions are in [`documentation/`](documentation/README.md).

---

## 1. What you need

| Tool | Version | Check with |
|---|---|---|
| [Node.js](https://nodejs.org) | **22 or newer** | `node -v` |
| npm | comes with Node | `npm -v` |
| [MongoDB](https://www.mongodb.com/try/download/community) | any recent version, running on your computer — **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster | MongoDB Compass connects to `mongodb://127.0.0.1:27017` |
| Git | any | `git --version` |

A normal local MongoDB install is fine for development.

---

## 2. First-time setup (once per computer)

All commands are run from the **repo root** (the `MPFSL` folder) unless stated otherwise.

### 2.1 Install the packages

```bash
npm install
```

This installs everything for `server/`, `shared/` and `Frontend-v2/` in one go (npm workspaces).

### 2.2 Create the API settings file

Copy the example settings:

```bash
# macOS / Linux / Git Bash
cp server/.env.example server/.env
```

```powershell
# Windows PowerShell
Copy-Item server\.env.example server\.env
```

Then open `server/.env` and change two lines:

1. **`SESSION_SECRET`** — replace the placeholder with a long random string. Generate one with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```

2. **`MONGODB_URI`** — where your database is:

   | You use | Set it to |
   |---|---|
   | MongoDB installed on your computer | `mongodb://127.0.0.1:27017/mpfsl-dev` *(the default)* |
   | MongoDB Atlas | the connection string from Atlas, ending in `/mpfsl-dev` |

   Don't add `?replicaSet=...` unless your MongoDB really is a replica set — with a normal install the
   API won't be able to connect.

Leave everything else as it is. `server/.env` is git-ignored — never commit it.

### 2.3 Set up the database and your admin account

Make sure MongoDB is running, then:

```bash
npm run init -- --email you@example.com --name "Your Name"
```

It checks the database, creates its indexes, and creates your admin account. It prints a
**temporary password once** — copy it. (Running it again later is safe; it won't create duplicates.)

---

## 3. Run it (every day)

Open **two terminals** in the repo root:

```bash
# terminal 1 — the API
npm run dev:server
```

```bash
# terminal 2 — the website + admin panel
npm run dev:web
```

Then open:

| Address | What you get |
|---|---|
| http://localhost:5180 | the public website |
| http://admin.localhost:5180 | the admin panel |
| http://localhost:8080/api/health | API status — should show `{"ok":true,"db":"up"}` |

Both servers reload automatically when you save a code file. **Exception:** after changing
`server/.env`, stop the API (`Ctrl+C`) and start it again.

### First login

Go to http://admin.localhost:5180, log in with the email you gave `npm run init` and the temporary
password it printed. You'll be asked to choose your own password straight away. Then you can create
accounts for other staff on the **Users** page.

---

## 4. Useful commands

Run from the repo root.

| Command | Does |
|---|---|
| `npm run dev:server` | start the API (port 8080) |
| `npm run dev:web` | start the website + admin panel (port 5180) |
| `npm run init -- --email … --name "…"` | set up a database + first admin (safe to re-run) |
| `npm run reset-password -- --email …` | give an account a new temporary password (e.g. forgotten password) |
| `npm run test:server` | run the API tests (uses its own temporary database — doesn't touch yours) |
| `npm run lint:server` / `npm run lint:web` | check code style |
| `npm run build:web` | production build of the website + admin panel into `Frontend-v2/dist` |

---

## 5. Troubleshooting

| Problem | Cause and fix |
|---|---|
| Admin panel shows **502 Bad Gateway** for `/api/...` | The API isn't running. Start `npm run dev:server` and check its terminal for errors. |
| API says **"Can't connect to MongoDB"** | MongoDB isn't running, or `MONGODB_URI` in `server/.env` is wrong. If the message mentions a replica set, remove `?replicaSet=...` from `MONGODB_URI`. |
| API says **"Invalid environment configuration"** | A required setting is missing in `server/.env` — usually `SESSION_SECRET` (needs 32+ characters). Copy `.env.example` again if unsure. |
| **"Email or password is incorrect"** on login | Check the email is exactly the one used with `npm run init` (typos count). Forgot the temporary password? `npm run reset-password -- --email you@example.com` |
| **"Too many wrong passwords"** | The account is locked for 15 minutes after 5 wrong tries — wait, or run `npm run reset-password`. |
| `npm run dev:web` says **port 5180 is already in use** | Another copy is still running (close its terminal), or another program uses 5180 — stop it. |
| `npm run dev:server` says **port 8080 is in use** | Another program uses 8080. Stop it, or change `PORT` in `server/.env` and create `Frontend-v2/.env.local` containing `API_PROXY_TARGET=http://localhost:<new port>`, then restart both. |
| **admin.localhost** doesn't open | Use Chrome, Edge or Firefox (they send `*.localhost` to your computer automatically). Make sure `npm run dev:web` is running. |
| The API warns **"MongoDB is running standalone"** | Normal with a local MongoDB install — nothing to fix. Production uses Atlas. |
| npm prints **"allow-scripts"** warnings during install | Harmless. |

---

## 6. Repository layout

```
MPFSL/
├── Frontend-v2/      # the website + admin panel (React, Vite) — what gets deployed
├── server/           # the API (Express, MongoDB) — see server/README.md
├── shared/           # validation rules used by both the API and the admin panel
├── documentation/    # plans: architecture, API, data model, deployment, roadmap
└── Frontend/         # design version 1 (3D race) — kept for reference, not deployed
```

Other files at the root (`index.html`, `styles.css`, `script.js`, `mpfsl-preview*.html`, `images/`)
are the earlier static website and design previews. The Python files (`src/`, `tests/`,
`pyproject.toml`, `requirements.txt`, `notebooks/`, `docs/`) are left over from the original repo
template and aren't used by the website.

### Running design version 1 (optional)

`Frontend/` isn't part of the main setup. To look at it:

```bash
cd Frontend
npm install
npm run dev
```

More detail: [server/README.md](server/README.md) (API) · [Frontend-v2/README.md](Frontend-v2/README.md)
(website + admin panel) · [documentation/deployment.md](documentation/deployment.md) (going live).
