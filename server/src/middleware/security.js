import cors from 'cors'
import helmet from 'helmet'
import { env } from '../config/env.js'
import { forbidden } from '../lib/errors.js'

// Routes the public website may call (read-only, no cookies).
const PUBLIC_READ_PATHS = /^\/api\/(news|site-photos|health)(\/|$)/

// CORS rules per origin:
// - admin panel: every route, with cookies
// - public website: GET on public routes only, without cookies
// - anything else: no CORS headers (the browser blocks the response)
const corsPerRequest = cors((req, callback) => {
  const origin = req.header('Origin')
  if (origin && origin === env.ADMIN_ORIGIN) {
    return callback(null, { origin: true, credentials: true, maxAge: 600 })
  }
  if (origin && env.PUBLIC_ORIGINS.includes(origin) && req.method === 'GET' && PUBLIC_READ_PATHS.test(req.originalUrl)) {
    return callback(null, { origin: true, credentials: false, maxAge: 600 })
  }
  return callback(null, { origin: false })
})

// CSRF protection on top of SameSite cookies: any browser request that changes data must come
// from the admin panel. Requests without an Origin header (curl, server scripts) are allowed,
// because they can't carry a victim's cookies from another site.
function checkOriginOnWrites(req, _res, next) {
  const safe = req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS'
  const origin = req.header('Origin')
  if (safe || !origin || origin === env.ADMIN_ORIGIN) return next()
  next(forbidden('Requests from this origin are not allowed'))
}

export function securityMiddleware() {
  return [
    helmet({
      // The API only returns JSON; nothing should ever be rendered from it.
      contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
    corsPerRequest,
    checkOriginOnWrites,
  ]
}
