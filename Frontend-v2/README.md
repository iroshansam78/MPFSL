# MPFSL Website (React + Vite)

The launch version of the Modern Pentathlon Federation of Sri Lanka website **and its admin panel**.
One build serves both addresses:

| Address | Shows | Code |
|---|---|---|
| `www.mpfsl.lk` | public site: `/`, `/about`, `/programmes`, `/news`, `/gallery`, `/contact` | `src/App.jsx`, `src/data/pages.js`, `src/sections/`… (plain CSS) |
| `admin.mpfsl.lk` | admin panel (staff login) | `src/admin/` (Tailwind) |

`src/main.jsx` checks the hostname and loads one or the other as a separate chunk with its own CSS,
so public visitors never download admin code. Version 1 (the dark 3D scroll "race") is kept in
`../Frontend/` for reference and is not deployed.

**What's different in version 2:** light theme by default with a dark-mode toggle, a full-screen
photo slideshow hero (WebGL cross-fade with mouse/tilt parallax), photos in the About and
Programmes sections, and a discipline photo gallery.

## Run it

This folder is an npm workspace — install from the **repo root**:

```bash
npm install                 # at the repo root, once
npm run dev:web             # or `npm run dev` inside Frontend-v2
```

| Open | For |
|---|---|
| http://localhost:5180 | public site |
| http://admin.localhost:5180 | admin panel (no setup needed — `*.localhost` always points to your machine) |

The admin panel needs the API running too (`npm run dev:server`, see `server/README.md`). The dev
server forwards `/api` to `http://localhost:8080`, so nothing needs configuring. Port 5180 is fixed
(not Vite's usual 5173) to avoid clashing with other projects.

```bash
npm run build:web           # production build into Frontend-v2/dist (both halves), with every public
                            # page pre-rendered to HTML + sitemap.xml (see below)
npm run lint:web
npm run images --workspace frontend-v2   # after adding/replacing a photo in public/images/news
```

**How the production build works:** `vite build` → a second build of `src/entry-server.jsx` for
Node → `scripts/prerender.js` writes one HTML file per page in `src/data/pages.js`. The browser then
*hydrates* that HTML, so components must render the same thing at build time and in the browser —
don't read `window`, `document`, the date or random values while rendering (use effects, or
`useSyncExternalStore` with a server value like `hooks/useTheme.js`). Details:
[architecture.md → Public site pages](../documentation/architecture.md#public-site-pages).

To check a production build locally: `npm run build:web`, then `npx vite preview` in `Frontend-v2`
(note: `preview` doesn't apply `vercel.json`'s clean URLs — open `/about.html`).

## Admin panel

| Screen | Status |
|---|---|
| Login, forced "choose your password", logout | ✅ |
| Layout: sidebar (drawer on phones), top bar, light/dark toggle | ✅ |
| Dashboard | ✅ (links only for now) |
| Users (admins only): create accounts, make admin/editor, deactivate, reset password | ✅ |
| My account: profile + change password | ✅ |
| News, Gallery, Media library | placeholder pages until their API exists (roadmap Phases 2–4) |

Styling: use the **semantic Tailwind colours** from `src/admin/styles/admin.css` — `bg-surface`,
`text-ink`, `text-muted`, `border-line`, `bg-brand`, `text-danger`… They switch automatically between
light and dark mode. Forms validate with the same zod schemas as the API (`@mpfsl/shared`).
Deployment (one Vercel project, both domains, security headers in `vercel.json`):
[documentation/deployment.md](../documentation/deployment.md).

## Folder structure

```
src/
├── main.jsx               # picks public site or admin panel by hostname; hydrates pre-rendered pages
├── PublicSite.jsx         # public site in the browser (BrowserRouter)
├── entry-server.jsx       # public site at build time (StaticRouter) — used by scripts/prerender.js
├── App.jsx                # public site: header, routes, footer, lightbox (+ its CSS)
├── admin/                 # admin panel (Tailwind) — only loaded on admin.mpfsl.lk
├── assets/images/         # logo + federation photos
├── data/                  # ALL site content: text, links, news, photo lists
│   ├── pages.js           #   every page: URL, menu label, title, description, banner
│   ├── responsiveImages.json # WebP sizes made by `npm run images`
│   ├── photos.js          #   federation photos (local)
│   ├── stockPhotos.js     #   Unsplash discipline photos + credits
│   └── hero.js            #   slideshow slides, facts, slide duration
├── hooks/                 # useSmoothScroll, useReveal, useTheme, useHeroSlides
├── utils/                 # smoothScroll (Lenis + header state), theme (light/dark)
├── styles/                # variables.css (light + dark tokens), global.css
├── scene/                 # WebGL hero slideshow (loaded on demand)
│   ├── HeroCanvas.jsx     #   <Canvas>
│   ├── SlideshowPlane.jsx #   transitions + parallax
│   ├── shaders.js         #   GLSL
│   └── loadSlides.js      #   loads photos/depth maps, falls back to Unsplash
├── components/
│   ├── layout/            # Header, ThemeToggle, Footer, PageHeader (banner + breadcrumbs)
│   ├── ui/                # SectionHead, SafeImage, PhotoGrid, Lightbox, TagLinks, SocialLinks
│   └── icons/
├── sections/              # Hero, About, Programmes, News, Gallery, Stats, Contact
└── pages/                 # HomePage (all sections), Page (banner + sections), NotFoundPage
scripts/
├── prerender.js           # writes the pre-rendered pages, 404.html and sitemap.xml
└── optimize-images.js     # `npm run images`: WebP copies of the federation photos
```

## Common edits

- **Add a page:** add it to `src/data/pages.js` (title, description, banner) and a `<Route>` in
  `src/App.jsx`. The menu, footer, breadcrumbs, `<head>`, pre-rendered file and sitemap follow.

- **Hero slides:** `src/data/hero.js`. For the best effect, add your own photos and depth maps
  — see `public/images/README.md`.
- **News stories:** `stories` in `src/data/news.js` (photos registered in `src/data/photos.js`;
  new photo files → run `npm run images`).
- **Gallery:** `src/data/gallery.js`.
- **Colours (both themes):** `src/styles/variables.css`.
