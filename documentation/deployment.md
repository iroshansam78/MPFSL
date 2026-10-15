# Deployment

## Hosting

| Part | Where | Why |
|---|---|---|
| Public site (`website.lk`) | **Cloudflare Pages**, building `Frontend-v2/` | static build, free, same dashboard as R2 and DNS |
| Admin panel (`admin.website.lk`) | **Cloudflare Pages** (second project), building `admin/` | static build, free |
| API (`api.website.lk`) | **Railway** (decided), Node 22 LTS | git push to deploy, HTTPS included; Express + Mongoose + sharp need a normal Node server (Cloudflare Workers don't support them well) |
| Database | **MongoDB Atlas** (M0 free to start, M10 once live for backups) | managed, backups, choose the Singapore or Mumbai region (closest to Sri Lanka) |
| Images | **Cloudflare R2** + custom domain `media.website.lk` | free egress, Cloudflare cache |

`Frontend/` (version 1) is not deployed. The API is a plain Node app, so it can move from Railway to
a VPS later without code changes.

## Railway setup (API)

| Setting | Value |
|---|---|
| Service source | this GitHub repo, **root directory `server`** |
| Region | Asia (Singapore) — closest to Sri Lanka and to the Atlas cluster |
| Build / start | `npm ci` / `node src/index.js` (Railway detects Node automatically) |
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
`railway run --service api node scripts/create-admin.js` from a developer's machine (uses the
service's variables without copying secrets locally).

## DNS (Cloudflare)

The domain's DNS should be managed in Cloudflare (needed for the R2 custom domain anyway).

| Record | Points to |
|---|---|
| `website.lk`, `www` | Cloudflare Pages — public site |
| `admin` | Cloudflare Pages — admin project |
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

### `admin/.env` and public site `.env`

| Variable | Example |
|---|---|
| `VITE_API_URL` | `https://api.website.lk/api` |

## Environments

| | Development | Production |
|---|---|---|
| Public site | `localhost:5173` | `website.lk` |
| Admin | `localhost:5174` | `admin.website.lk` |
| API | `localhost:8080` | `api.website.lk` (Railway) |
| Database | Atlas free cluster `mpfsl-dev` (or local MongoDB) | Atlas `mpfsl` |
| Bucket | `mpfsl-media-dev` | `mpfsl-media` |

A **staging** setup (`staging-admin.website.lk` etc.) is optional but recommended before launch, so
the federation can try the admin panel without touching the live site.

## Deploy steps (summary)

1. Push to `main` → Cloudflare Pages builds `Frontend-v2` and `admin` automatically.
2. Railway deploys `server/` from `main` and only switches traffic over once `/api/health` passes.
3. After the first deploy: `railway run … create-admin.js`, then `import-existing.js` once.
