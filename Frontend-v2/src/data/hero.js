import { stockPhotos, unsplashUrl } from './stockPhotos.js'

/*
 * Slides that have their own photo + depth map in public/images/hero/<key>.jpg and
 * public/images/depth/<key>.png (see public/images/README.md). Add a key here after adding its files;
 * slides not listed use the Unsplash photo, so the site never requests files that don't exist.
 */
const localPhotos = new Set([])

/*
 * Hero slideshow. A slide uses its local photo + depth map when listed above, otherwise (or if they
 * fail to load) the Unsplash photo. `focus` is the point (0–1, 0–1) kept in frame when the screen is
 * narrower than the photo.
 */
const slide = (key, title, caption, focus = [0.5, 0.45]) => ({
  key,
  src: localPhotos.has(key) ? `/images/hero/${key}.jpg` : null,
  depth: localPhotos.has(key) ? `/images/depth/${key}.png` : null,
  remote: unsplashUrl(stockPhotos[key].id, 2400),
  title,
  caption,
  focus,
})

export const hero = {
  slides: [
    slide('fencing', 'Fencing', 'Épée · one touch decides the bout'),
    slide('swimming', 'Swimming', '200m freestyle · every second counts'),
    slide('obstacle', 'Obstacle', 'The new discipline · climb, swing, vault'),
    slide('running', 'Laser Run', 'The finale · run, shoot, repeat'),
  ],
  // Shown if none of the slides load.
  fallback: {
    key: 'fallback',
    src: unsplashUrl(stockPhotos.fencing.id, 2400),
    depth: null,
    title: 'Fencing',
    caption: 'Épée · one touch decides the bout',
    focus: [0.5, 0.5],
  },
  facts: [
    { value: '2013', label: 'Full UIPM member' },
    { value: '28th', label: 'Asian Games 2026 · Gayani Dassanayake' },
    { value: '15+', label: 'Coaches certified by UIPM' },
  ],
  // How long each slide stays on screen (ms).
  slideDuration: 7000,
}

/*
 * The still photo that shows first, before the WebGL slideshow. Offered in several widths so phones
 * don't download the 2400 px version. vite.config.js adds a matching <link rel="preload"> to
 * index.html, so the browser starts fetching it before any JavaScript runs.
 */
const stillWidths = [640, 960, 1280, 1920, 2400]
const stillId = stockPhotos.fencing.id

export const heroStill = {
  src: unsplashUrl(stillId, 1280),
  srcSet: stillWidths.map((width) => `${unsplashUrl(stillId, width)} ${width}w`).join(', '),
  sizes: '100vw',
}
