import { stockPhotos, unsplashUrl } from './stockPhotos.js'

/*
 * Hero slideshow. Each slide tries a local photo + depth map first (public/images/hero/<key>.jpg and
 * public/images/depth/<key>.png — see public/images/README.md) and falls back to the Unsplash photo.
 * `focus` is the point (0–1, 0–1) kept in frame when the screen is narrower than the photo.
 */
const slide = (key, title, caption, focus = [0.5, 0.45]) => ({
  key,
  src: `/images/hero/${key}.jpg`,
  depth: `/images/depth/${key}.png`,
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
