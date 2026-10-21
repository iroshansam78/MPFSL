import * as audit from '../audit/audit.service.js'
import * as mediaService from '../media/media.service.js'
import { SitePhoto } from './sitePhotos.model.js'

/** Every changed spot. */
export const list = () => SitePhoto.find().populate('media').sort({ key: 1 })

/**
 * Sets the caption of a spot and, when `media` is given, its photo. The photo it replaces is
 * deleted unless something else still uses it.
 */
export async function update(key, { alt, media }, actor) {
  if (media) await mediaService.assertExists([media])

  const previous = await SitePhoto.findOne({ key })
  const item = await SitePhoto.findOneAndUpdate(
    { key },
    { $set: { alt, updatedBy: actor?.id, ...(media && { media }) } },
    { upsert: true, returnDocument: 'after', runValidators: true },
  ).populate('media')

  if (media && previous?.media && String(previous.media) !== String(media)) {
    await mediaService.removeIfUnused(previous.media, actor)
  }
  await audit.record({ action: media ? 'sitePhoto.replace' : 'sitePhoto.caption', user: actor, details: { key } })
  return item
}

/** Puts the original photo and caption back in a spot. */
export async function restore(key, actor) {
  const item = await SitePhoto.findOneAndDelete({ key })
  if (!item) return
  if (item.media) await mediaService.removeIfUnused(item.media, actor)
  await audit.record({ action: 'sitePhoto.restore', user: actor, details: { key } })
}
