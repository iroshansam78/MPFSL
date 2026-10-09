# MPFSL Website (React + Vite + three.js)

Website for the Modern Pentathlon Federation of Sri Lanka. The page opens with a scroll-driven 3D
"race" through the disciplines (fencing → swimming → obstacle → laser run), then regular content
sections (About, Programmes, News, Gallery, Contact).

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
├── main.jsx, App.jsx      # entry point; App wires the 3D world, header, page and lightbox together
├── assets/images/         # logo + federation photos
├── constants/colors.js    # brand + discipline colours (shared by 3D scene and sections)
├── data/                  # ALL site content: text, links, news stories, photo lists
├── hooks/                 # useJourneyScroll (smooth scroll + zones), useReveal (fade-in on scroll)
├── utils/                 # journeyScroll (Lenis + scroll progress), filmGrain
├── styles/                # variables.css (design tokens), global.css (base styles, buttons, sections)
├── scene/                 # everything 3D (react-three-fiber)
│   ├── World.jsx          # <Canvas>, lights, post-processing, list of stages
│   ├── CameraRig.jsx      # flies the camera along CAMERA_PATH as you scroll
│   ├── constants.js       # stage positions, camera keyframes, glow()
│   ├── objects/           # reusable 3D parts (Runner, Track, Epee, Sparks…)
│   └── stages/            # one file per stage (HeroStage, FencingStage, SwimStage…)
├── components/
│   ├── layout/            # Header, Footer, Hud (stage rail + progress bar)
│   ├── ui/                # SectionHead, PhotoGrid, Lightbox, SafeImage, TagLinks, SocialLinks
│   └── icons/
├── sections/              # page sections: Journey (text over the 3D stages), About, News…
└── pages/HomePage.jsx     # puts the sections in order
```

Each component lives in its own folder with its `.jsx` and `.css` side by side.

## Common edits

- **Add a news story:** add an entry to `stories` in `src/data/news.js`. Put new photos in
  `src/assets/images/news/` and register them in `src/data/photos.js`.
- **Change gallery photos:** `src/data/gallery.js` (`size: 'tall'` / `'wide'` for big tiles).
- **Change journey text** (e.g. "One touch. One point."): `src/sections/Journey/Journey.jsx`.
- **Move the camera / stages:** `CAMERA_PATH` and `STAGE_Z` in `src/scene/constants.js`.
- **Colours:** `src/constants/colors.js` and `src/styles/variables.css` (keep both in sync).

## Notes

- The 3D scene loads in its own chunk (`React.lazy`) so the page text appears first.
- Rendering pauses once the visitor scrolls deep into the content, to save battery.
- Visitors with "reduce motion" turned on get normal scrolling and no animations.
