import { rateLimit } from 'express-rate-limit'
import { env } from '../config/env.js'
import { tooManyRequests } from '../lib/errors.js'

const limitHandler = (message) => (_req, _res, next) => next(tooManyRequests(message))

// Each call creates a fresh counter, so every app instance (and every test file) starts clean.
export const createLoginLimiter = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: env.LOGIN_RATE_LIMIT,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: limitHandler('Too many login attempts. Please wait 15 minutes and try again.'),
  })

// Generous overall limit, just to blunt abuse of the API as a whole.
export const createApiLimiter = () =>
  rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: limitHandler('Too many requests. Please slow down.'),
  })
