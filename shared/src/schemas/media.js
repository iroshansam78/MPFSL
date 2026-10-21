import { z } from 'zod'
import { objectId } from './common.js'

// Description of a photo for blind visitors and search engines. Required for every upload.
export const altText = z
  .string()
  .trim()
  .min(3, { error: 'Describe the photo in a few words (at least 3 characters)' })
  .max(300, { error: 'Keep the description under 300 characters' })

export const updateMediaBody = z.strictObject({ alt: altText })

export const mediaListQuery = z.strictObject({
  q: z.string().trim().max(100).optional(),
  unused: z.enum(['true', 'false']).optional(),
})

// Name of a photo spot on the website (see Frontend-v2/src/data/photoSpots.js), e.g. gallery.0.
// News photos are part of each story instead (schemas/news.js).
export const SITE_PHOTO_KEY = /^gallery\.\d{1,2}$/

export const sitePhotoKeyParam = z.strictObject({
  key: z.string().regex(SITE_PHOTO_KEY, { error: 'No such photo spot' }),
})

// New caption for a spot, and optionally a new (already uploaded) photo. Without `media` the spot
// keeps its current photo (the original one, if it was never replaced).
export const updateSitePhotoBody = z.strictObject({
  alt: altText,
  media: objectId.optional(),
})
