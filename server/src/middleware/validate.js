/**
 * Validates parts of the request with zod schemas and puts the parsed values on `req.valid`.
 * Invalid input throws a ZodError, which errorHandler turns into a 400 with per-field messages.
 *
 * @param {{ params?: import('zod').ZodType, query?: import('zod').ZodType, body?: import('zod').ZodType }} schemas
 */
export const validate = (schemas) => (req, _res, next) => {
  req.valid = {}
  for (const part of /** @type {const} */ (['params', 'query', 'body'])) {
    if (schemas[part]) req.valid[part] = schemas[part].parse(req[part] ?? {})
  }
  next()
}
