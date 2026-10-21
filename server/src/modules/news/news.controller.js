import { toAdminStory, toPublicStory } from './news.mapper.js'
import * as newsService from './news.service.js'

/** The featured story (if it's published) and the other published stories, in order. */
export async function listPublic(_req, res) {
  const stories = await newsService.listPublic()
  const featured = stories.find((story) => story.featured)
  res.set('Cache-Control', 'public, max-age=60')
  res.json({
    featured: featured ? toPublicStory(featured) : null,
    stories: stories.filter((story) => !story.featured).map(toPublicStory),
  })
}

export async function listAdmin(_req, res) {
  const stories = await newsService.listAdmin()
  res.json({ stories: stories.map(toAdminStory) })
}

export async function get(req, res) {
  res.json({ story: toAdminStory(await newsService.get(req.valid.params.id)) })
}

export async function create(req, res) {
  const story = await newsService.create(req.valid.body, req.user)
  res.status(201).json({ story: toAdminStory(story) })
}

export async function update(req, res) {
  const story = await newsService.update(req.valid.params.id, req.valid.body, req.user)
  res.json({ story: toAdminStory(story) })
}

export async function setStatus(req, res) {
  const story = await newsService.setStatus(req.valid.params.id, req.valid.body.status, req.user)
  res.json({ story: toAdminStory(story) })
}

export async function feature(req, res) {
  const story = await newsService.feature(req.valid.params.id, req.user)
  res.json({ story: toAdminStory(story) })
}

export async function reorder(req, res) {
  const stories = await newsService.reorder(req.valid.body.ids, req.user)
  res.json({ stories: stories.map(toAdminStory) })
}

export async function remove(req, res) {
  await newsService.remove(req.valid.params.id, req.user)
  res.status(204).end()
}
