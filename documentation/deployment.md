# Deployment

## Hosting

| Part | Where | Why |
|---|---|---|
| Public site (`www.mpfsl.lk`) **and** admin panel (`admin.mpfsl.lk`, not set up yet) | **Vercel**, one project building `Frontend-v2/`, deployed automatically on every push to `main` | one static build serves both; the app picks public site vs admin panel by hostname (see [architecture.md](architecture.md)) |
| API (`api.mpfsl.lk`, not set up yet) | **Railway** (decided), Node 22 LTS | git push to deploy, HTTPS included; Express + Mongoose + sharp need a normal Node server |
| Database | **MongoDB Atlas** (M0 free to start, M10 once live for backups) | managed, backups, choose the Singapore or Mumbai region (closest to Sri Lanka) |
| Images | **Cloudflare R2** + custom domain `media.mpfsl.lk` | free egress, Cloudflare cache |

`Frontend/` (version 1) is not deployed. The API is a plain Node app, so it can move from Railway to
a VPS later without code changes.

> **Checked live on 29 Oct 2026:** `mpfsl.lk` answers with a 308 redirect to **`https://www.mpfsl.lk/`**
> (served by Vercel, Singapore edge), so **`www.mpfsl.lk` is the canonical address** used in canonical
> URLs, the sitemap and structured data. Vercel already sends `Strict-Transport-Security:
> max-age=63072000`. `admin.` and `api.mpfsl.lk` don't resolve yet, so until the API is deployed
> the public site uses its built-in news and photos (see `src/utils/api.js`).

## Vercel setup (public site + admin panel)

| Setting | Value |
|---|---|
| Root directory | `Frontend-v2` — **check this in the Vercel dashboard**: `Frontend-v2/vercel.json` (security headers) is only read if it is |
| Build | `npm run build` (set in `vercel.json`): Vite build + pre-rendering of every public page; output `dist` |
| Environment variable | `VITE_API_URL=https://api.mpfsl.lk/api` — **only once the API is live**; without it the site doesn't call any API |
| Domains | `www.mpfsl.lk` (primary), `mpfsl.lk` → redirects to www; later `admin.mpfsl.lk` on the same project |
| Deploys | every push to `main` goes live; pull requests get preview URLs |
| Routing | one HTML file per page (`about.html` …), served at `/about` by `cleanUrls`; unknown paths get `404.html` with status 404. On `admin.mpfsl.lk` every path is rewritten to `index.html` (the admin panel routes itself) — see `vercel.json` |

## Security headers

Judged in BestWeb.LK (Security, 20 points). Target: **grade A on securityheaders.com** for both
`www.mpfsl.lk` and `admin.mpfsl.lk`.

**Public site:** [`Frontend-v2/vercel.json`](../Frontend-v2/vercel.json) sends, on every path:

| Header | Value / why |
|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob: https://images.unsplash.com https://media.mpfsl.lk; connect-src 'self' https://api.mpfsl.lk; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | camera, microphone, geolocation, payment, USB all off |
| `Cache-Control` on `/assets/*` | `public, max-age=31536000, immutable` (file names contain a content hash) |

Notes:

- Fonts are self-hosted (`@fontsource`, see `src/styles/fonts.css`), so no Google domains are needed.
- `'unsafe-inline'` is for **styles only** (React `style` attributes and the preloader's inline CSS);
  scripts stay `'self'`. JSON-LD (`<script type="application/ld+json">`) is data, not script, so it
  isn't blocked.
- **Don't add `Cross-Origin-Opener-Policy`.** We tried it: it makes Lighthouse's mobile run fail
  (`NO_NAVSTART`), which would also hurt a judge's own Lighthouse test.
- Remove `images.unsplash.com` once the stock photos are replaced; add a video host (e.g.
  `frame-src https://www.youtube-nocookie.com`) when videos are added.
- Test a CSP change before pushing: build, serve `dist` with the same headers, open the site and look
  for "violates the following Content Security Policy" in the console. Every push to `main` goes live.
- HSTS: Vercel's default (2 years) is in place. Add `includeSubDomains` only after `admin.`, `api.` and
  `media.` are all live on HTTPS and nothing else on the domain uses plain HTTP.

**Admin panel (`admin.mpfsl.lk`, when added):** Vercel headers can match on the host, so add a
second rule to `vercel.json` with `"has": [{ "type": "host", "value": "admin.mpfsl.lk" }]`:

| Header | Value |
|---|---|
| `X-Robots-Tag` | `noindex, nofollow` |
| `X-Frame-Options` | `DENY` |
| `Content-Security-Policy` | as the public site, but `frame-ancestors 'none'` |
| `Referrer-Policy` | `same-origin` |

**DNS / WAF:** if the domain's DNS moves to Cloudflare (needed for `media.mpfsl.lk` on R2), keep the
Vercel records "DNS only" (grey cloud), as Vercel recommends, and turn on Cloudflare's WAF/bot rules
only for proxied subdomains. Vercel's own firewall and DDoS protection cover the website.

## Search engines

- `robots.txt` is in `Frontend-v2/public/`; `sitemap.xml` is generated by the build from
  `src/data/pages.js` (one entry per page, `lastmod` = build date).
- Every page is pre-rendered with its own title, description, canonical URL on `https://www.mpfsl.lk/`,
  Open Graph tags (share card `public/og-image.jpg`, 1200 × 630), `SportsOrganization` + `WebSite`
  JSON-LD and, on inner pages, `BreadcrumbList`. The 404 page is `noindex`.
- Add `www.mpfsl.lk` to **Google Search Console** and **Bing Webmaster Tools** (verify with a DNS TXT
  record), submit the sitemap, and check the coverage and Core Web Vitals reports monthly.
- If `mpfsl.net` is kept, 301-redirect it to `https://www.mpfsl.lk/`.

## Railway setup (API)

| Setting | Value |
|---|---|
| Service source | this GitHub repo, **root directory = repo root** (the API uses the `shared/` workspace package) |
| Watch paths | `server/**`, `shared/**` — so frontend-only commits don't redeploy the API |
| Region | Asia (Singapore) — closest to Sri Lanka and to the Atlas cluster |
| Build / start | `npm ci --workspace server` / `npm start --workspace server` |
| Port | read `process.env.PORT` — Railway sets it |
| Health check path | `/api/health` |
| Custom domain | `api.mpfsl.lk` → add in Railway, then create the CNAME it shows in Cloudflare DNS |
| Variables | all of `server/.env` below, set in the Railway dashboard (never committed) |
| Environments | `production` + `staging` (Railway environments), each with its own variables |

Two things the code must handle because of Railway:

1. **Behind a proxy:** call `app.set('trust proxy', 1)` in Express. Otherwise `Secure` cookies are not
   set (the app thinks the request is plain HTTP) and rate limiting sees every visitor as the same IP.
2. **MongoDB Atlas IP access list:** Railway's outgoing IP addresses change between deploys unless
   the project uses Railway's static outbound IPs (paid plans). Either enable static IPs and allow
   only those in Atlas, or (to start) allow `0.0.0.0/0` in Atlas and rely on a long random database
   password + a database user limited to the `mpfsl` database. Move to static IPs before launch.

Running scripts against production (`init`, `create-admin`, `import-existing`) — from a developer's
machine, using the service's variables without copying secrets locally:

```bash
railway run --service api npm run init --workspace server -- --email you@example.com --name "Your Name"
```

`init` checks the database, creates the indexes and the first admin. It is required on a new
database and after deploys that add models/indexes, because the API doesn't build indexes on
startup in production. Safe to re-run.

## DNS (Cloudflare)

The domain's DNS should be managed in Cloudflare (needed for the R2 custom domain anyway).

| Record | Points to |
|---|---|
| `mpfsl.lk`, `www`, `admin` | the Vercel project (added as domains in Vercel; `mpfsl.lk` redirects to `www`) |
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
| `MEDIA_BASE_URL` | `https://media.mpfsl.lk` | used to build image URLs |
| `ADMIN_ORIGIN` | `https://admin.mpfsl.lk` | CORS + Origin check |
| `PUBLIC_ORIGINS` | `https://mpfsl.lk,https://www.mpfsl.lk` | CORS for public routes |

### `Frontend-v2` (Vercel)

| Variable | Production | Development |
|---|---|---|
| `VITE_API_URL` | `https://api.mpfsl.lk/api` | leave unset → `/api`, forwarded by the Vite dev server |
| `API_PROXY_TARGET` | — | only if the API isn't on `http://localhost:8080` |

## Environments

| | Development | Production |
|---|---|---|
| Public site | `http://localhost:5180` | `mpfsl.lk` |
| Admin | `http://admin.localhost:5180` (no setup — browsers send `*.localhost` to your machine) | `admin.mpfsl.lk` |
| API | `localhost:8080` (reached through the dev server's `/api` proxy) | `api.mpfsl.lk` (Railway) |
| Database | `npm run dev:db` — private replica set on port 27018, data in `server/.data` (or an Atlas dev cluster) | Atlas `mpfsl` |
| Bucket | `mpfsl-media-dev` | `mpfsl-media` |

Why the proxy in development: browsers treat `admin.localhost` and `localhost` as different sites, so
they won't send the login cookie straight to `localhost:8080`. Going through the dev server keeps it
same-origin. In production `admin.mpfsl.lk` and `api.mpfsl.lk` are the same site, so no proxy.

A **staging** setup is optional but recommended before launch, so the federation can try the admin
panel without touching the live site. Name the admin address with the `admin.` prefix (e.g.
`admin.staging.mpfsl.lk`), because that prefix is how the app knows to show the admin panel.

## Deploy steps (summary)

1. Push to `main` → Vercel builds `Frontend-v2` (public site + admin panel) and puts it live automatically. GitHub Actions (`.github/workflows/ci.yml`) runs lint, tests, build and `npm audit` on the same push.
2. Railway deploys `server/` from `main` and only switches traffic over once `/api/health` passes.
3. After the first deploy: `railway run … npm run init …` (indexes + first admin), then
   `import-existing.js` once (moves the website's current photos into R2 — Phase 3).
4. After later deploys that add new models: `railway run … npm run init` again (no flags needed).
