import { photos } from './photos.js'

// `size` is optional: 'tall' spans two rows, 'wide' spans two columns.
export const gallery = {
  label: 'Gallery',
  title: 'Sporting moments and federation highlights',
  images: [
    { ...photos.isiwarunaObstacle, size: 'tall' },
    photos.isiwarunaFencing,
    photos.national2025Running,
    { ...photos.national2025Group, size: 'wide' },
  ],
}
