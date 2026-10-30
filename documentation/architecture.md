# Architecture

## Overview

```mermaid
flowchart LR
  visitor([Visitor]) --> site["mpfsl.lk<br/>public site"]
  staff([Federation staff]) --> admin["admin.mpfsl.lk<br/>admin panel"]

  subgraph pages["Vercel — one project, one build of Frontend-v2"]
    site
    admin
  end

  site -- "GET news / gallery (public)" --> api["api.mpfsl.lk<br/>Express API (Node, on Railway)"]
  admin -- "login + create / edit / upload" --> api

  api --> db[("MongoDB Atlas<br/>news, gallery, media, users")]
  api -- "store images (S3 API)" --> r2[("Cloudflare R2<br/>bucket: mpfsl-media")]

  site -- "load images" --> cdn["media.mpfsl.lk<br/>R2 custom domain + Cloudflare cache"]
  admin -- "image previews" --> cdn
  cdn --> r2
```

- **One frontend, two addresses.** `Frontend-v2` is built once and served on both `mpfsl.lk` and
  `admin.mpfsl.lk`. On load it checks the hostname: `admin.*` gets the admin panel, anything else
  the public site. Each half is a separate lazy-loaded chunk with its own CSS, so visitors never
  download admin code and the two style systems never mix.
- Both halves are static; neither talks to MongoDB or R2 directly — only the API does.
- **R2 credentials never leave the server.** Browsers only ever *read* images, through
  `media.mpfsl.lk`.
- **Images are served by Cloudflare**, not by the API, so the API stays light and pictures load fast
  and are cached worldwide.

## Repository layout

```
MPFSL/
├── Frontend/          # version 1 — kept for reference, not deployed
├── Frontend-v2/       # THE frontend: public site (mpfsl.lk) + admin panel (admin.mpfsl.lk)
├── server/            # Express API (api.mpfsl.lk)
├── shared/            # validation schemas + constants used by the API and the admin panel
└── documentation/     # these planning docs
```

`shared`, `server` and `Frontend-v2` are npm workspaces (root `package.json`); `Frontend/` is not.

### `server/` (Express API)

Organised as feature modules (`modules/news`, `modules/gallery`, `modules/media`, `modules/auth`,
`modules/users`…), each with its own model, validation, service, controller, mapper and routes.
Full layout, patterns and conventions: **[backend-architecture.md](backend-architecture.md)**.

### `Frontend-v2/src/` (public site + admin panel)

```
src/
├── main.jsx                  # picks the public site or the admin panel by hostname
├── App.jsx …                 # public site (plain CSS, unchanged layout: sections/, components/, data/…)
└── admin/                    # admin panel (Tailwind) — only loaded on admin.mpfsl.lk
    ├── AdminApp.jsx          # providers (React Query, toasts) + admin styles
    ├── AdminRoutes.jsx       # routes + auth guards
    ├── api/                  # fetch wrapper (sends cookies, handles 401) + one module per resource
    ├── hooks/                # useAuth, useUsers, useTheme, useToast… (later useNews, useGallery)
    ├── lib/                  # config, theme, query client, helpers
    ├── pages/                # Login, ChangePassword, Dashboard, Account, users/, gallery/, news/
    ├── components/
    │   ├── layout/           # AdminLayout, Sidebar, AuthLayout, ThemeToggle, RouteGuards
    │   ├── forms/            # ChangePasswordForm (later BlockEditor, LinkListEditor…)
    │   └── ui/               # Button, Field, Input, Modal, ConfirmDialog, Badge, Alert, Toast…
    └── styles/admin.css      # Tailwind + light/dark colour tokens
```

The public site keeps its conventions (one component per folder, `.jsx` + `.css`); the admin panel
uses Tailwind classes, so its components are single `.jsx` files.

## Public site pages

Since Sprint 2 (Oct 2026) the public site has real pages, each pre-rendered to HTML with its own title,
description, canonical URL and breadcrumbs: **`/`, `/about`, `/programmes`, `/news`, `/gallery`,
`/contact`** and a 404 page. The home page still shows every section as an overview. The target
structure ([BestWeb.LK 2027](bestweb-2027.md)), which new pages are added towards:

| URL | Page | Data from |
|---|---|---|
| `/` | Home: hero, stats, latest achievement, upcoming competitions, featured athletes, latest news, gallery, contact | API + static |
| `/about`, `/about/committees`, `/about/governance` | History, vision, mission, committees, coaches, officials, governance, safeguarding, anti-doping | static (later API) |
| `/modern-pentathlon` | The sport, five disciplines (interactive), rules, equipment, beginner guide | static |
| `/athletes`, `/athletes/<slug>` | Teams, searchable list, profiles | API `athletes` |
| `/competitions`, `/competitions/<slug>` | Calendar, event page (venue, registration, documents, results, photos) | API `competitions` |
| `/results`, `/rankings` | Results explorer, national rankings, records | API `results` |
| `/international` | UIPM, Asian Games, World Cups / Championships, achievements | static + API |
| `/news`, `/news/<slug>` | News list and one page per story | API `newsstories` |
| `/gallery` | Photos and videos | API |
| `/development` | Youth, schools, talent, coaching, officials | static |
| `/resources` | Rules, regulations, circulars, forms, policies | API `documents` |
| `/contact`, `/privacy`, `/cookies` | Contact form, legal pages | static |
| anything else | 404 page | — |

How it's built:

- **One list of pages:** `src/data/pages.js` (path, menu label, title, description, banner heading).
  It feeds the router (`App.jsx`), the menu and footer, each page's `<head>`, breadcrumbs, and the
  build's HTML files and `sitemap.xml`. **To add a page:** add it to that list and a `<Route>` in `App.jsx`.
- **Routing:** `react-router` — `BrowserRouter` in the browser (`PublicSite.jsx`), `StaticRouter` at
  build time (`entry-server.jsx`). `hooks/usePageChange.js` updates `<head>`, scrolls to the top and
  moves focus to the main content when the page changes.
- **Pre-rendering** (`npm run build`): `vite build` → `vite build --ssr src/entry-server.jsx` →
  `scripts/prerender.js`, which writes `dist/about.html` etc. (served at `/about` via `cleanUrls`),
  `404.html` (`noindex`) and `sitemap.xml`. Each file gets the page's rendered HTML, its `<title>`,
  description, canonical URL, Open Graph tags and `BreadcrumbList` JSON-LD, with the CSS inline.
- **Hydration:** the browser takes over the pre-rendered HTML instead of rebuilding it
  (`hydrateRoot` in `main.jsx`). The first browser render must match the build exactly, so anything
  that depends on the visitor uses `useSyncExternalStore` with a server value: the theme
  (`hooks/useTheme.js`), reduced motion (`hooks/useReducedMotion.js`); the footer year is the build
  year. **Don't read `window`, `document`, the date or random numbers while rendering** — only in
  effects. A mismatch shows up as a console error and costs Lighthouse points.
- **Behind the preloader:** the pre-rendered content is in the HTML (for search engines, link
  previews, no-JS visitors) but not laid out until the app has loaded (`:root:not(.app-ready) #root`
  in `index.html`), so a phone only fetches what the preloader needs first. Scroll-reveal hides
  only what's below the first screen (`hooks/useReveal.js`).
- **Admin host:** `admin.mpfsl.lk` is served the same files (`vercel.json` rewrites every path to
  `index.html`); `main.jsx` drops the public content and CSS and renders the admin panel.
- **Performance budget:** Lighthouse ≥ 90 on mobile for every page. Phones, slow connections and
  reduced motion get the hero's still photo only (no WebGL). Federation photos are served as WebP
  in 480/960/1440 px (`npm run images` → `SafeImage` adds the `srcset`). Fonts are self-hosted,
  with size-matched fallback fonts so the swap doesn't move anything (`styles/fonts.css`).
- **Languages (later):** `/si/…` and `/ta/…` with `hreflang` links, translations checked by a person.

## Main flows

### Visitor opens the news section

1. Public site loads (static files from `mpfsl.lk`).
2. It calls `GET api.mpfsl.lk/api/news` → API returns **published** stories only, newest first,
   with full image URLs on `media.mpfsl.lk`.
3. Browser loads the images from `media.mpfsl.lk` (cached by Cloudflare).

### Admin publishes a story with photos

1. Admin logs in at `admin.mpfsl.lk` → API sets a secure session cookie.
2. Admin uploads photos → `POST /api/admin/media` → API checks each file, resizes it to WebP in
   three sizes, stores them in R2, saves a `Media` record and returns its id + preview URLs.
3. Admin writes the story, attaches the uploaded photos (each needs alt text) and saves as **draft**.
4. Admin clicks **Publish** → story becomes visible to `GET /api/news` immediately.

See [media-storage-r2.md](media-storage-r2.md) for the upload pipeline in detail.

## Why these choices

| Choice | Reason |
|---|---|
| Separate `api.` subdomain | Public site and admin share one API; clean CORS and cookie rules |
| Upload through the API (not direct-to-R2) | API can reject bad files and produce consistent image sizes; simpler and safer for low upload volume |
| Structured story blocks (not free HTML) | Matches the existing `news.js` format, so the public site renders it unchanged, and no risk of injected HTML |
| One frontend for both addresses | One build and one Vercel project to host; shared logo, fonts and theme; all logic lives in the API |
| Admin on its own subdomain | Its own cookies/CORS rules and security headers, and easy to recognise as staff-only |
