import { stock } from './stockPhotos.js'

// `size` is optional: 'tall' spans two rows, 'wide' spans two columns.
// These are the gallery's fixed spots, in order (spot names in photoSpots.js). The admin panel can
// replace the photo or caption of each spot; these are the originals.
export const gallery = {
  label: 'Gallery',
  title: 'The five disciplines of modern pentathlon',
  highlight: 'five disciplines',
  images: [
    { ...stock('fencingCrowd', 1400), size: 'wide' },
    { ...stock('obstacleClimb', 900), size: 'tall' },
    stock('swimmingRace', 900),
    stock('obstacleVault', 900),
    stock('runningRace', 900),
    { ...stock('swimmingCap', 1400), size: 'wide' },
  ],
}
