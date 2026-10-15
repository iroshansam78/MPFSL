# MPFSL Website (React + Vite)

The launch version of the Modern Pentathlon Federation of Sri Lanka website **and its admin panel**.
One build serves both addresses:

| Address | Shows | Code |
|---|---|---|
| `website.lk` | public site | `src/App.jsx`, `src/sections/`, `src/components/`… (plain CSS) |
| `admin.website.lk` | admin panel (staff login) | `src/admin/` (Tailwind) |

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
npm run build:web           # production build into Frontend-v2/dist (both halves)
npm run lint:web
```

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
Deployment (one Cloudflare Pages project, both domains, admin-only headers):
[documentation/deployment.md](../documentation/deployment.md).

## Folder structure

```
src/
├── main.jsx               # picks public site or admin panel by hostname
├── App.jsx                # public site: header, page, footer, lightbox (+ its CSS)
├── admin/                 # admin panel (Tailwind) — only loaded on admin.website.lk
├── assets/images/         # logo + federation photos
├── data/                  # ALL site content: text, links, news, photo lists
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
│   ├── layout/            # Header, ThemeToggle, Footer
│   ├── ui/                # SectionHead, SafeImage, PhotoGrid, Lightbox, TagLinks, SocialLinks
│   └── icons/
├── sections/              # Hero, About, Programmes, News, Gallery, Stats, Contact
└── pages/HomePage.jsx     # puts the sections in order
```

## Common edits

- **Hero slides:** `src/data/hero.js`. For the best effect, add your own photos and depth maps
  — see `public/images/README.md`.
- **News stories:** `stories` in `src/data/news.js` (photos registered in `src/data/photos.js`).
- **Gallery:** `src/data/gallery.js`.
- **Colours (both themes):** `src/styles/variables.css`.
