// Errors with an HTTP status and a stable code. Throw these from services; errorHandler turns
// them into the standard JSON error response (see documentation/api.md).
export class AppError extends Error {
  /**
   * @param {number} status HTTP status code
   * @param {string} code machine-readable code, e.g. 'NOT_FOUND'
   * @param {string} message message safe to show to the user
   * @param {Record<string, string>} [fields] per-field messages for forms
   */
  constructor(status, code, message, fields) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

export const badRequest = (message, fields) => new AppError(400, 'BAD_REQUEST', message, fields)
export const unauthorized = (message = 'Please log in') => new AppError(401, 'UNAUTHORIZED', message)
export const forbidden = (message = 'You don’t have permission to do that') =>
  new AppError(403, 'FORBIDDEN', message)
export const notFound = (what = 'Resource') => new AppError(404, 'NOT_FOUND', `${what} not found`)
export const conflict = (message) => new AppError(409, 'CONFLICT', message)
export const tooManyRequests = (message) => new AppError(429, 'TOO_MANY_REQUESTS', message)
