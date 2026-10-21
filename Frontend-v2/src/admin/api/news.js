import { apiFetch } from './client.js'

export const listStories = () => apiFetch('/admin/news').then((d) => d.stories)

export const getStory = (id) => apiFetch(`/admin/news/${id}`).then((d) => d.story)

export const createStory = (body) => apiFetch('/admin/news', { method: 'POST', body }).then((d) => d.story)

export const updateStory = (id, body) => apiFetch(`/admin/news/${id}`, { method: 'PUT', body }).then((d) => d.story)

export const setStoryStatus = (id, status) =>
  apiFetch(`/admin/news/${id}/status`, { method: 'PUT', body: { status } }).then((d) => d.story)

export const featureStory = (id) => apiFetch(`/admin/news/${id}/feature`, { method: 'POST' }).then((d) => d.story)

export const reorderStories = (ids) => apiFetch('/admin/news/order', { method: 'PUT', body: { ids } }).then((d) => d.stories)

export const deleteStory = (id) => apiFetch(`/admin/news/${id}`, { method: 'DELETE' })
