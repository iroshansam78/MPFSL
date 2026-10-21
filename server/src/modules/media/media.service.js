import mongoose from 'mongoose'
import { customAlphabet } from 'nanoid'
import { badRequest, conflict, notFound } from '../../lib/errors.js'
import { inspectImage, makeVariants } from '../../lib/images.js'
import { logger } from '../../lib/logger.js'
import { currentDriver, putObject, removeObjects } from '../../lib/storage.js'
import * as audit from '../audit/audit.service.js'
import { Media } from './media.model.js'

const randomId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 20)

const newFolder = () => {
  const now = new Date()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  return `media/${now.getUTCFullYear()}/${month}/${randomId()}`
}

const variantKeys = (media) => Object.values(media.variants.toObject?.() ?? media.variants).map((v) => v.key)

/**
 * Turns one uploaded file into a Media record: checks it, makes the WebP sizes, stores them.
 * If storing fails half-way, the files already stored are removed again.
 * @param {{ buffer: Buffer, originalname: string }} file  (from multer)
 * @param {string} alt
 * @param {{ id: string, email?: string } | null} actor
 */
export async function createFromUpload(file, alt, actor) {
  const label = file.originalname ? `"${file.originalname}"` : 'This file'
  await inspectImage(file.buffer, label)
  const variants = await makeVariants(file.buffer)

  const folder = newFolder()
  const stored = []
  try {
    for (const variant of variants) {
      const key = `${folder}/${variant.name}.webp`
      await putObject(key, variant.buffer, 'image/webp')
      stored.push(key)
    }

    const media = await Media.create({
      storage: currentDriver,
      folder,
      variants: Object.fromEntries(
        variants.map((v) => [v.name, { key: `${folder}/${v.name}.webp`, width: v.width, height: v.height, bytes: v.bytes }]),
      ),
      alt,
      originalName: file.originalname?.slice(0, 200),
      uploadedBy: actor?.id,
    })

    await audit.record({ action: 'media.upload', user: actor, target: { type: 'media', id: String(media._id) } })
    return media
  } catch (err) {
    await removeObjects(stored).catch((cleanupErr) => logger.error({ err: cleanupErr, stored }, 'Upload cleanup failed'))
    throw err
  }
}

/** Media library listing, newest first. `unused` = not shown anywhere yet. */
export async function list({ q, unused } = {}) {
  const filter = {}
  if (q) filter.alt = { $regex: escapeRegex(q), $options: 'i' }
  if (unused === 'true') filter._id = { $nin: await usedMediaIds() }
  return Media.find(filter).sort({ createdAt: -1 }).limit(500)
}

export async function updateAlt(id, alt, actor) {
  const media = await Media.findByIdAndUpdate(id, { alt }, { returnDocument: 'after', runValidators: true })
  if (!media) throw notFound('Photo')
  await audit.record({ action: 'media.update', user: actor, target: { type: 'media', id: String(media._id) } })
  return media
}

/** Deletes a photo and its files. Refused while it's still shown on the website. */
export async function remove(id, actor) {
  const media = await Media.findById(id)
  if (!media) throw notFound('Photo')
  if (await isInUse(media._id)) {
    throw conflict('This photo is still used on the website. Replace it on the website first.')
  }

  await deleteMedia(media, actor)
}

/** Deletes a photo that is no longer shown anywhere; does nothing while it's still used. */
export async function removeIfUnused(id, actor) {
  const media = await Media.findById(id)
  if (media && !(await isInUse(media._id))) await deleteMedia(media, actor)
}

async function deleteMedia(media, actor) {
  await removeObjects(variantKeys(media), media.storage)
  await media.deleteOne()
  await audit.record({ action: 'media.delete', user: actor, target: { type: 'media', id: String(media._id) } })
}

/** Throws unless every id is an existing photo. Returns them in the given order. */
export async function assertExists(ids) {
  const found = await Media.find({ _id: { $in: ids } })
  const byId = new Map(found.map((m) => [String(m._id), m]))
  const missing = ids.filter((id) => !byId.has(String(id)))
  if (missing.length) throw badRequest(`Photo not found: ${missing.join(', ')}`)
  return ids.map((id) => byId.get(String(id)))
}

// ---------- usage ----------

// Collections that can point to a photo. Looked up by model name so this module doesn't import
// site-photos/news (which import this one).
const USAGES = [
  { model: 'SitePhoto', field: 'media' },
  { model: 'NewsStory', field: 'images.media' },
]

async function isInUse(mediaId) {
  for (const { model, field } of USAGES) {
    const Model = mongoose.models[model]
    if (Model && (await Model.exists({ [field]: mediaId }))) return true
  }
  return false
}

async function usedMediaIds() {
  const ids = []
  for (const { model, field } of USAGES) {
    const Model = mongoose.models[model]
    if (Model) ids.push(...(await Model.distinct(field)))
  }
  return ids
}

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
