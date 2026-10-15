import { apiFetch } from './client.js'

export const listUsers = () => apiFetch('/admin/users').then((d) => d.users)

/** @returns {Promise<{ user: object, temporaryPassword: string }>} */
export const createUser = (body) => apiFetch('/admin/users', { method: 'POST', body })

export const updateUser = (id, body) => apiFetch(`/admin/users/${id}`, { method: 'PATCH', body }).then((d) => d.user)

/** @returns {Promise<{ user: object, temporaryPassword: string }>} */
export const resetUserPassword = (id) => apiFetch(`/admin/users/${id}/reset-password`, { method: 'POST' })
