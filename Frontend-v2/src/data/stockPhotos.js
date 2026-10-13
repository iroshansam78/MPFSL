// Discipline photos from Unsplash (used in the hero, the gallery and as image fallbacks).
// Photographers are credited in the footer automatically from this list.
export const stockPhotos = {
  fencing: {
    id: 'photo-1636812028922-023445fbab51',
    alt: 'Fencer in white kit leaping forward in attack',
    by: 'Nathanaël Desmeules',
    page: 'https://unsplash.com/photos/GULSORQ6Gws',
  },
  fencingBout: {
    id: 'photo-1636812028884-8046cff5e68d',
    alt: 'Fencers in a bout on the piste',
    by: 'Nathanaël Desmeules',
    page: 'https://unsplash.com/photos/0gQOp8Z1evg',
  },
  fencingCrowd: {
    id: 'photo-1505619656705-59ebc350b547',
    alt: 'Two fencers compete in front of spectators',
    by: 'Eugene Lim',
    page: 'https://unsplash.com/photos/J9yPHHc0Fe4',
  },
  swimming: {
    id: 'photo-1560088937-d46f082d558b',
    alt: 'Swimmer racing in a competition pool',
    by: 'Serena Repice Lentini',
    page: 'https://unsplash.com/photos/q4tScOAuIm8',
  },
  swimmingRace: {
    id: 'photo-1560090947-5307abc46ffc',
    alt: 'Swimmers racing in lanes during a competition',
    by: 'Serena Repice Lentini',
    page: 'https://unsplash.com/photos/Ue24S2JU81k',
  },
  swimmingCap: {
    id: 'photo-1782382555829-aec832d90d55',
    alt: 'Swimmer in cap and goggles in a blue pool',
    by: 'Omar Abozeid',
    page: 'https://unsplash.com/photos/IJcWXo-IZv4',
  },
  obstacle: {
    id: 'photo-1779831910085-d476ba0834b4',
    alt: 'Athlete climbing over a barrier on an obstacle course in Cairo',
    by: 'Omar Abozeid',
    page: 'https://unsplash.com/photos/2xoGXQ90-34',
  },
  obstacleVault: {
    id: 'photo-1779831909953-e3c9d59b4a73',
    alt: 'Athlete vaulting over an obstacle',
    by: 'Omar Abozeid',
    page: 'https://unsplash.com/photos/NTRVMoMJQEA',
  },
  obstacleClimb: {
    id: 'photo-1779831910104-9ddc66d221f5',
    alt: 'Athlete climbing a metal obstacle',
    by: 'Omar Abozeid',
    page: 'https://unsplash.com/photos/8mIJHQMqtos',
  },
  running: {
    id: 'photo-1744060204728-f68e434a3edf',
    alt: 'Runner sprinting on a track in golden light',
    by: 'Jorge Alberto Vega Barrera',
    page: 'https://unsplash.com/photos/1-nuy7fD3fw',
  },
  runningRace: {
    id: 'photo-1759674861540-afed9f86f94a',
    alt: 'Runners in motion during a race',
    by: 'Pierre-Antoine Franck',
    page: 'https://unsplash.com/photos/W2pBsQaT6FQ',
  },
}

// Unsplash image URL at a given width.
export const unsplashUrl = (id, width = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`

// { src, alt } for a stock photo by key.
export const stock = (key, width) => ({
  src: unsplashUrl(stockPhotos[key].id, width),
  alt: stockPhotos[key].alt,
})

// A federation photo that falls back to a stock photo if it fails to load.
export const withFallback = (photo, fallbackKey) => ({
  ...photo,
  fallback: unsplashUrl(stockPhotos[fallbackKey].id, 1200),
  fallbackAlt: stockPhotos[fallbackKey].alt,
})

// One entry per photographer, for the footer credits.
export const photoCredits = [...new Map(Object.values(stockPhotos).map((p) => [p.by, p])).values()]
