import { ApiError } from '../api/client.js'

/**
 * Puts the server's per-field errors onto the matching form fields (react-hook-form).
 * Returns a message for anything that isn't tied to a field, to show above the form.
 * @param {unknown} error
 * @param {(name: string, error: { message: string }) => void} setError
 * @param {string[]} fieldNames fields that exist in this form
 */
export function applyServerErrors(error, setError, fieldNames) {
  if (!(error instanceof ApiError)) return 'Something went wrong. Please try again.'

  let placedOnField = false
  for (const [name, message] of Object.entries(error.fields ?? {})) {
    if (fieldNames.includes(name)) {
      setError(name, { message })
      placedOnField = true
    }
  }
  return placedOnField ? null : error.message
}
