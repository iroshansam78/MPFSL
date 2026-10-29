import { API_URL } from '../lib/config.js'

// Error from the API, in the server's standard format (see documentation/api.md).
export class ApiError extends Error {
  /**
   * @param {number} status HTTP status (0 = network failure)
   * @param {string} code e.g. 'VALIDATION_ERROR', 'UNAUTHORIZED'
   * @param {string} message safe to show to the user
   * @param {Record<string, string>} [fields] per-field messages for forms
   */
  constructor(status, code, message, fields) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

/**
 * Calls the API with the session cookie. Returns the parsed JSON (or null for 204),
 * throws ApiError otherwise.
 * @param {string} path e.g. '/auth/me'
 * @param {{ method?: string, body?: unknown, signal?: AbortSignal }} [options]  FormData bodies are sent as uploads
 */
export async function apiFetch(path, { method = 'GET', body, signal } = {}) {
  const isForm = body instanceof FormData
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: 'include', // send the session cookie to api.mpfsl.lk
      headers: body !== undefined && !isForm ? { 'Content-Type': 'application/json' } : undefined,
      body: body === undefined || isForm ? body : JSON.stringify(body),
      signal,
    })
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    throw new ApiError(0, 'NETWORK', 'Can’t reach the server. Check your internet connection and try again.')
  }

  if (response.status === 204) return null

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const error = data?.error
    throw new ApiError(
      response.status,
      error?.code ?? 'UNKNOWN',
      error?.message ?? 'Something went wrong. Please try again.',
      error?.fields,
    )
  }
  return data
}
