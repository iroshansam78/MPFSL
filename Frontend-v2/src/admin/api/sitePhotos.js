import { apiFetch } from './client.js'

/** The changed photo spots (a new photo and/or caption). The others show their original photo. */
export const listSitePhotos = () => apiFetch('/admin/site-photos').then((d) => d.photos)

/** Saves a spot's caption and, when `media` (an uploaded photo's id) is given, its new photo. */
export const updateSitePhoto = (key, body) =>
  apiFetch(`/admin/site-photos/${key}`, { method: 'PUT', body }).then((d) => d.photo)

/** Puts the original photo and caption back. */
export const restoreSitePhoto = (key) => apiFetch(`/admin/site-photos/${key}`, { method: 'DELETE' })
