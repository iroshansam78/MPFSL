import { toAdminSitePhoto, toPublicSitePhoto } from './sitePhotos.mapper.js'
import * as sitePhotosService from './sitePhotos.service.js'

export async function listPublic(_req, res) {
  const items = await sitePhotosService.list()
  res.set('Cache-Control', 'public, max-age=60')
  res.json({ photos: items.map(toPublicSitePhoto) })
}

export async function listAdmin(_req, res) {
  const items = await sitePhotosService.list()
  res.json({ photos: items.map(toAdminSitePhoto) })
}

export async function update(req, res) {
  const item = await sitePhotosService.update(req.valid.params.key, req.valid.body, req.user)
  res.json({ photo: toAdminSitePhoto(item) })
}

export async function restore(req, res) {
  await sitePhotosService.restore(req.valid.params.key, req.user)
  res.status(204).end()
}
