# Deployment

## Hosting

| Part | Where | Why |
|---|---|---|
| Public site (`website.lk`) **and** admin panel (`admin.website.lk`) | **One Cloudflare Pages project** building `Frontend-v2/`, with both custom domains attached | one static build serves both; the app picks public site vs admin panel by hostname (see [architecture.md](architecture.md)) |
| API (`api.website.lk`) | **Railway** (decided), Node 22 LTS | git push to deploy, HTTPS included; Express + Mongoose + sharp need a normal Node server (Cloudflare Workers don't support them well) |
| Database | **MongoDB Atlas** (M0 free to start, M10 once live for backups) | managed, backups, choose the Singapore or Mumbai region (closest to Sri Lanka) |
| Images | **Cloudflare R2** + custom domain `media.website.lk` | free egress, Cloudflare cache |

`Frontend/` (version 1) is not deployed. The API is a plain Node app, so it can move from Railway to
a VPS later without code changes.

## Cloudflare Pages setup (public site + admin panel)

| Setting | Value |
|---|---|
| Root directory | *(repo root — needed for the npm workspaces)* |
| Build command | `npm ci && npm run build --workspace frontend-v2` |
| Output directory | `Frontend-v2/dist` |
| Environment variable | `VITE_API_URL=https://api.website.lk/api` |
| Custom domains | `website.lk`, `www.website.lk` **and** `admin.website.lk` — all on this one project |
| SPA routing | nothing to set up: with no `404.html`, Pages serves `index.html` for every path |

**Admin-only security headers.** Pages' `_headers` file matches paths, not hostnames, so the strict
headers for the admin panel are added with a Cloudflare **Transform Rule** (Rules → Transform Rules →
Modify Response Header) for requests where *Hostname equals `admin.website.lk`*:

| Header | Value |
|---|---|
| `X-Robots-Tag` | `noindex, nofollow` |
| `X-Frame-Options` | `DENY` |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob: https://media.website.lk https://images.unsplash.com; connect-src 'self' https://api.website.lk; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` |
| `Referrer-Policy` | `same-origin` |

(The theme script is a file, `public/theme-init.js`, not inline, so `script-src 'self'` is enough.)

## Railway setup (API)

| Setting | Value |
|---|---|
| Service source | this GitHub repo, **root directory = repo root** (the API uses the `shared/` workspace package) |
| Watch paths | `server/**`, `shared/**` — so frontend-only commits don't redeploy the API |
| Region | Asia (Singapore) — closest to Sri Lanka and to the Atlas cluster |
| Build / start | `npm ci --workspace server` / `npm start --workspace server` |
| Port | read `process.env.PORT` — Railway sets it |
| Health check path | `/api/health` |
| Custom domain | `api.website.lk` → add in Railway, then create the CNAME it shows in Cloudflare DNS |
| Variables | all of `server/.env` below, set in the Railway dashboard (never committed) |
| Environments | `production` + `staging` (Railway environments), each with its own variables |

Two things the code must handle because of Railway:

1. **Behind a proxy:** call `app.set('trust proxy', 1)` in Express. Otherwise `Secure` cookies are not
   set (the app thinks the request is plain HTTP) and rate limiting sees every visitor as the same IP.
2. **MongoDB Atlas IP access list:** Railway's outgoing IP addresses change between deploys unless
   the project uses Railway's static outbound IPs (paid plans). Either enable static IPs and allow
   only those in Atlas, or (to start) allow `0.0.0.0/0` in Atlas and rely on a long random database
   password + a database user limited to the `mpfsl` database. Move to static IPs before launch.

Running scripts (`create-admin.js`, `import-existing.js`) against production:
`railway run --service api npm run create-admin --workspace server -- --email … --name "…"` from a
developer's machine (uses the service's variables without copying secrets locally).

## DNS (Cloudflare)

The domain's DNS should be managed in Cloudflare (needed for the R2 custom domain anyway).

| Record | Points to |
|---|---|
| `website.lk`, `www`, `admin` | the same Cloudflare Pages project (added as custom domains in Pages) |
| `api` | CNAME to the Railway domain shown in the service's settings (DNS only / grey cloud, so Railway can issue the certificate) |
| `media` | R2 bucket custom domain (set up from the R2 dashboard) |

> `.lk` domains are registered through the LK Domain Registry (or a reseller). Pointing the
> nameservers to Cloudflare is done in the registrar's panel.

## Environment variables

### `server/.env`

| Variable | Example | Notes |
|---|---|---|
| `NODE_ENV` | `production` | |
| `PORT` | `8080` | set automatically on Railway |
| `MONGODB_URI` | `mongodb+srv://…/mpfsl` | |
| `SESSION_SECRET` | 64 random chars | signs session cookies |
| `R2_ACCOUNT_ID` | | Cloudflare account id |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | | bucket-scoped R2 token |
| `R2_BUCKET` | `mpfsl-media` | |
| `MEDIA_BASE_URL` | `https://media.website.lk` | used to build image URLs |
| `ADMIN_ORIGIN` | `https://admin.website.lk` | CORS + Origin check |
| `PUBLIC_ORIGINS` | `https://website.lk,https://www.website.lk` | CORS for public routes |

### `Frontend-v2` (Cloudflare Pages)

| Variable | Production | Development |
|---|---|---|
| `VITE_API_URL` | `https://api.website.lk/api` | leave unset → `/api`, forwarded by the Vite dev server |
| `API_PROXY_TARGET` | — | only if the API isn't on `http://localhost:8080` |

## Environments

| | Development | Production |
|---|---|---|
| Public site | `http://localhost:5180` | `website.lk` |
| Admin | `http://admin.localhost:5180` (no setup — browsers send `*.localhost` to your machine) | `admin.website.lk` |
| API | `localhost:8080` (reached through the dev server's `/api` proxy) | `api.website.lk` (Railway) |
| Database | Atlas free cluster `mpfsl-dev` (or local MongoDB) | Atlas `mpfsl` |
| Bucket | `mpfsl-media-dev` | `mpfsl-media` |

Why the proxy in development: browsers treat `admin.localhost` and `localhost` as different sites, so
they won't send the login cookie straight to `localhost:8080`. Going through the dev server keeps it
same-origin. In production `admin.website.lk` and `api.website.lk` are the same site, so no proxy.

A **staging** setup is optional but recommended before launch, so the federation can try the admin
panel without touching the live site. Name the admin address with the `admin.` prefix (e.g.
`admin.staging.website.lk`), because that prefix is how the app knows to show the admin panel.

## Deploy steps (summary)

1. Push to `main` → Cloudflare Pages builds `Frontend-v2` (public site + admin panel) automatically.
2. Railway deploys `server/` from `main` and only switches traffic over once `/api/health` passes.
3. After the first deploy: `railway run … create-admin.js`, then `import-existing.js` once.
