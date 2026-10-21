// Values the API and the admin panel must agree on.

export const ROLES = /** @type {const} */ (['editor', 'admin'])

export const PASSWORD_MIN_LENGTH = 10
export const PASSWORD_MAX_LENGTH = 200

export const STORY_STATUSES = /** @type {const} */ (['draft', 'published'])

export const UPLOAD_LIMITS = {
  maxFileBytes: 15 * 1024 * 1024,
  maxFilesPerRequest: 10,
}
