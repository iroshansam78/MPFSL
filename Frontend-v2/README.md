# MPFSL Website — Version 2 (React + Vite)

Second design option for the Modern Pentathlon Federation of Sri Lanka website.
Version 1 (the dark 3D scroll "race") lives in `../Frontend/` and is kept unchanged while
the federation decides which version to launch.

**What's different in version 2:** light theme by default with a dark-mode toggle, a full-screen
photo slideshow hero (WebGL cross-fade with mouse/tilt parallax), photos in the About and
Programmes sections, and a discipline photo gallery.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
npm run lint
```

## Folder structure

```
src/
├── main.jsx, App.jsx      # entry point; App wires header, page, footer and lightbox
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
