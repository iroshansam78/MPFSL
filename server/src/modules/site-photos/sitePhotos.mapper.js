import { mediaUrls, toMediaResponse } from '../media/media.mapper.js'

/** For the website: the caption, plus the photo's sizes when the photo was replaced. */
export function toPublicSitePhoto(item) {
  const urls = item.media ? mediaUrls(item.media) : null
  return {
    key: item.key,
    alt: item.alt,
    ...(urls && {
      src: urls.medium,
      large: urls.large,
      thumb: urls.thumb,
      width: item.media.variants.large.width,
      height: item.media.variants.large.height,
    }),
  }
}

/** For the admin panel. `media` is null while the spot shows its original photo. */
export function toAdminSitePhoto(item) {
  return {
    key: item.key,
    alt: item.alt,
    media: item.media ? toMediaResponse(item.media) : null,
    updatedAt: item.updatedAt,
  }
}
