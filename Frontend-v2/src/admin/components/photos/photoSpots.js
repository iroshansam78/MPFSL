import { UPLOAD_LIMITS } from '@mpfsl/shared'

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] // no HEIC: iPhones then convert to JPEG
export const MAX_MB = UPLOAD_LIMITS.maxFileBytes / 1024 / 1024

const GALLERY_TIP = 'On phones the gallery shows every photo as a wide strip.'

// What fits each kind of photo spot on the website. `aspect` is roughly the spot's shape on a
// computer screen (the website crops photos to fill it); the minimum size keeps the photo sharp.
export const SHAPES = {
  'gallery-normal': { label: 'Normal', photo: 'Landscape photo', aspect: [3, 2], minWidth: 1200, minHeight: 800, tip: GALLERY_TIP },
  'gallery-wide': { label: 'Wide', photo: 'Wide landscape photo', aspect: [3, 1], minWidth: 1500, minHeight: 500, tip: GALLERY_TIP },
  'gallery-tall': { label: 'Tall', photo: 'Portrait (upright) photo', aspect: [3, 4], minWidth: 900, minHeight: 1200, tip: GALLERY_TIP },
  featured: {
    label: 'Featured',
    photo: 'Square photo',
    aspect: [1, 1],
    minWidth: 1200,
    minHeight: 1200,
    tip: 'The bottom-left corner is covered by the result box (e.g. “28th overall in Nagoya”).',
  },
  'story-single': { label: 'Story', photo: 'Landscape photo', aspect: [16, 10], minWidth: 1200, minHeight: 750 },
  'story-grid': { label: 'Story', photo: 'Landscape photo', aspect: [4, 3], minWidth: 1000, minHeight: 750 },
}

/**
 * One photo spot for the admin panel, with its saved change (if any) applied.
 * @param {{ key: string, title: string, shape: keyof SHAPES, original: { src: string, alt: string } }} spot
 * @param {Map<string, { alt: string, media: object | null }> | undefined} changes  from useSitePhotos()
 */
export function buildSpot({ key, title, shape, original }, changes) {
  const change = changes?.get(key) ?? null
  return {
    key,
    title, // e.g. 'Photo 2 in the gallery'
    shape: SHAPES[shape],
    original,
    change, // null = untouched
    src: change?.media?.urls.medium ?? original.src,
    alt: change?.alt ?? original.alt,
  }
}

/** The spot shape of photo `index` in a news story with `count` photos (the website's layout). */
export function storyPhotoShape(index, count, featured) {
  if (featured && index === 0) return SHAPES.featured
  return count > 1 ? SHAPES['story-grid'] : SHAPES['story-single']
}

export const cssAspect = (shape) => `${shape.aspect[0]} / ${shape.aspect[1]}`
export const ratioLabel = (shape) => `${shape.aspect[0]}:${shape.aspect[1]}`

/** Problems that stop a file from being used. */
export function fileProblem(file) {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'This isn’t a JPEG, PNG or WebP photo.'
  if (file.size > UPLOAD_LIMITS.maxFileBytes) return `This photo is too large (${MAX_MB} MB at most).`
  return null
}

/** Advice when a photo will work but won't look its best in this spot. */
export function photoWarnings({ width, height }, shape) {
  const warnings = []
  const photoRatio = width / height
  const spotRatio = shape.aspect[0] / shape.aspect[1]
  if (photoRatio > spotRatio * 1.4) {
    warnings.push('Your photo is much wider than this spot: its left and right sides will be cut off.')
  } else if (photoRatio < spotRatio / 1.4) {
    warnings.push('Your photo is much taller than this spot: its top and bottom will be cut off.')
  }
  if (width < shape.minWidth || height < shape.minHeight) {
    warnings.push(
      `Your photo is ${width} × ${height} px, smaller than the recommended ${shape.minWidth} × ${shape.minHeight} px. It may look blurry.`,
    )
  }
  return warnings
}
