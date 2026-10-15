import { ApiError, apiFetch } from './client.js'

/** The logged-in user, or null when not logged in. */
export async function getMe() {
  try {
    const { user } = await apiFetch('/auth/me')
    return user
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null
    throw err
  }
}

export const login = (credentials) => apiFetch('/auth/login', { method: 'POST', body: credentials }).then((d) => d.user)

export const logout = () => apiFetch('/auth/logout', { method: 'POST' })

export const changePassword = ({ currentPassword, newPassword }) =>
  apiFetch('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } })
