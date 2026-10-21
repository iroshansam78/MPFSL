import { apiFetch } from './client.js'

/** Uploads one photo with its description. Returns the new media item. */
export function uploadPhoto(file, alt) {
  const form = new FormData()
  form.append('alt', alt)
  form.append('files', file)
  return apiFetch('/admin/media', { method: 'POST', body: form }).then((d) => d.media[0])
}

export const listMedia = (params = {}) =>
  apiFetch(`/admin/media?${new URLSearchParams(params)}`).then((d) => d.media)

export const updateMedia = (id, body) => apiFetch(`/admin/media/${id}`, { method: 'PATCH', body }).then((d) => d.media)

export const deleteMedia = (id) => apiFetch(`/admin/media/${id}`, { method: 'DELETE' })
