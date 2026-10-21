import { publicUrl } from '../../lib/storage.js'

// URLs aren't stored — they're built from the storage driver + key, so the media domain can change.
export function mediaUrls(media) {
  const v = media.variants
  return {
    thumb: publicUrl(v.thumb.key, media.storage),
    medium: publicUrl(v.medium.key, media.storage),
    large: publicUrl(v.large.key, media.storage),
  }
}

/** For the admin panel (media library, image picker). */
export function toMediaResponse(media) {
  return {
    id: String(media._id),
    alt: media.alt,
    width: media.variants.large.width,
    height: media.variants.large.height,
    originalName: media.originalName ?? null,
    urls: mediaUrls(media),
    createdAt: media.createdAt,
  }
}
