import { AppError, notFound } from '../lib/errors.js'
import { logger } from '../lib/logger.js'

// Unknown route → 404 in the standard error format.
export const notFoundHandler = (req, _res, next) => next(notFound(`Route ${req.method} ${req.path}`))

// Turns any thrown error into { error: { code, message, fields? } } with the right status.
// Unexpected errors are logged in full but only a generic message is sent to the client.
export function errorHandler(err, req, res, _next) {
  const error = toAppError(err)

  if (error.status >= 500) {
    (req.log ?? logger).error({ err }, 'Unhandled error')
  }

  res.status(error.status).json({
    error: {
      code: error.code,
      message: error.message,
      ...(error.fields && { fields: error.fields }),
    },
  })
}

function toAppError(err) {
  if (err instanceof AppError) return err

  if (err?.name === 'ZodError') {
    const fields = {}
    for (const issue of err.issues) {
      const key = issue.path.join('.') || '_'
      fields[key] ??= issue.message
    }
    return new AppError(400, 'VALIDATION_ERROR', 'Please check the highlighted fields', fields)
  }

  // Malformed ObjectId in a lookup → treat as "doesn't exist"
  if (err?.name === 'CastError') return notFound()

  // Unique index violation, e.g. an email that's already taken
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern ?? {})[0]
    return new AppError(409, 'CONFLICT', field ? `That ${field} is already in use` : 'Already exists',
      field ? { [field]: `That ${field} is already in use` } : undefined)
  }

  // Body too large / malformed JSON (from express.json)
  if (err?.type === 'entity.too.large') return new AppError(413, 'PAYLOAD_TOO_LARGE', 'Request is too large')
  if (err?.type === 'entity.parse.failed') return new AppError(400, 'BAD_JSON', 'Request body is not valid JSON')

  return new AppError(500, 'INTERNAL', 'Something went wrong. Please try again.')
}
