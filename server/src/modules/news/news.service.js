import { newsStoryBody } from '@mpfsl/shared'
import { badRequest, notFound } from '../../lib/errors.js'
import * as audit from '../audit/audit.service.js'
import * as mediaService from '../media/media.service.js'
import { NewsStory } from './news.model.js'

const withMedia = (query) => query.populate('images.media')
const mediaIds = (story) => story.images.filter((image) => image.media).map((image) => String(image.media._id ?? image.media))

/** What the website shows: published stories in order (the featured one included). */
export const listPublic = () => withMedia(NewsStory.find({ status: 'published' }).sort({ order: 1 }))

/** Every story, drafts included, for the admin panel. */
export const listAdmin = () => withMedia(NewsStory.find().sort({ order: 1 }))

export async function get(id) {
  const story = await withMedia(NewsStory.findById(id))
  if (!story) throw notFound('Story')
  return story
}

// The featured story's extras start from its title when nothing was filled in yet.
const defaultFeature = (story) => ({ heading: story.title, highlight: '', meta: '', stat: null, milestones: [] })

/** New stories go to the top of the list. */
export async function create(fields, actor) {
  await mediaService.assertExists(mediaIds(fields))
  const first = await NewsStory.findOne().sort({ order: 1 }).select('order')
  const story = await NewsStory.create({
    ...fields,
    order: (first?.order ?? 1) - 1,
    publishedAt: fields.status === 'published' ? new Date() : undefined,
    createdBy: actor?.id,
    updatedBy: actor?.id,
  })
  await audit.record({ action: 'news.create', user: actor, target: { type: 'news', id: String(story._id) } })
  return get(story._id)
}

/** Saves the whole story. Uploaded photos it no longer uses are deleted. */
export async function update(id, fields, actor) {
  const story = await NewsStory.findById(id)
  if (!story) throw notFound('Story')
  await mediaService.assertExists(mediaIds(fields))
  if (story.featured && !fields.feature) fields.feature = story.feature ?? defaultFeature(fields)

  const before = mediaIds(story)
  story.set({ ...fields, updatedBy: actor?.id })
  if (fields.status === 'published' && !story.publishedAt) story.publishedAt = new Date()
  await story.save()

  await removeUnused(before, mediaIds(story), actor)
  await audit.record({ action: 'news.update', user: actor, target: { type: 'news', id: String(story._id) } })
  return get(story._id)
}

export async function setStatus(id, status, actor) {
  const story = await NewsStory.findById(id)
  if (!story) throw notFound('Story')
  story.status = status
  if (status === 'published' && !story.publishedAt) story.publishedAt = new Date()
  await story.save()
  await audit.record({ action: `news.${status === 'published' ? 'publish' : 'unpublish'}`, user: actor, target: { type: 'news', id } })
  return get(story._id)
}

/** Makes this the featured story (the previous one becomes a normal story). */
export async function feature(id, actor) {
  const story = await NewsStory.findById(id)
  if (!story) throw notFound('Story')
  await NewsStory.updateMany({ featured: true, _id: { $ne: story._id } }, { featured: false })
  story.featured = true
  story.feature ??= defaultFeature(story)
  await story.save()
  await audit.record({ action: 'news.feature', user: actor, target: { type: 'news', id } })
  return get(story._id)
}

/** Saves a new order. `ids` must be every story, exactly once. */
export async function reorder(ids, actor) {
  const existing = await NewsStory.find().select('_id')
  const known = new Set(existing.map((story) => String(story._id)))
  const given = new Set(ids)
  if (given.size !== ids.length || given.size !== known.size || ids.some((id) => !known.has(id))) {
    throw badRequest('The stories changed while you were editing them. Reload the page and try again.')
  }
  await NewsStory.bulkWrite(ids.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { order } } })))
  await audit.record({ action: 'news.reorder', user: actor })
  return listAdmin()
}

/** Deletes a story and the photos uploaded for it (unless they're used elsewhere). */
export async function remove(id, actor) {
  const story = await NewsStory.findByIdAndDelete(id)
  if (!story) throw notFound('Story')
  await removeUnused(mediaIds(story), [], actor)
  await audit.record({ action: 'news.delete', user: actor, target: { type: 'news', id } })
}

async function removeUnused(before, after, actor) {
  const kept = new Set(after)
  for (const mediaId of before.filter((m) => !kept.has(m))) await mediaService.removeIfUnused(mediaId, actor)
}

/**
 * Uploads the photos that stories still take from the website (`src: '/images/news/…'`) to photo
 * storage and points the stories at the uploaded copies. Safe to re-run: only `src` photos are done,
 * and a file used by several stories is uploaded once.
 * @param {(src: string) => Promise<Buffer>} readFile  reads a built-in photo by its `src`
 * @param {(line: string) => void} [log]
 * @returns {Promise<{ uploaded: number, stories: number }>}
 */
export async function uploadBuiltInPhotos(readFile, log = () => {}) {
  const uploaded = new Map() // src → media id
  let changedStories = 0

  for (const story of await NewsStory.find({ 'images.src': { $exists: true, $ne: null } }).sort({ order: 1 })) {
    for (const image of story.images.filter((i) => i.src)) {
      if (!uploaded.has(image.src)) {
        const media = await mediaService.createFromUpload({ buffer: await readFile(image.src), originalname: image.src.split('/').pop() }, image.alt, null)
        uploaded.set(image.src, media._id)
        log(`uploaded ${image.src}`)
      }
      image.media = uploaded.get(image.src)
      image.src = undefined
    }
    await story.save()
    changedStories++
    log(`updated “${story.title}”`)
  }
  return { uploaded: uploaded.size, stories: changedStories }
}

/**
 * Copies the website's built-in stories into an empty database (once; `npm run init`).
 * @param {{ featured: object, stories: object[] }} news  builtInNews from Frontend-v2/src/data/news.js
 * @returns {Promise<number>} how many stories were added (0 if there already were some)
 */
export async function importBuiltIn(news) {
  if (await NewsStory.exists({})) return 0
  const entries = [{ ...news.featured, featured: true }, ...news.stories]
  // eslint-disable-next-line no-unused-vars -- `id` is the website's own key, not stored
  const docs = entries.map(({ id, featured = false, ...story }, order) => ({
    ...newsStoryBody.parse({ ...story, status: 'published', feature: featured ? story.feature : null }),
    featured,
    order,
    publishedAt: new Date(),
  }))
  await NewsStory.insertMany(docs)
  return docs.length
}
