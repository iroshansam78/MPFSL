import { AppError, forbidden, unauthorized } from '../lib/errors.js'

// Only lets logged-in users through. Users with a temporary password must change it first,
// so they're blocked from everything else until then.
export function requireAuth(req, _res, next) {
  if (!req.user) return next(unauthorized())
  if (req.user.mustChangePassword) {
    return next(new AppError(403, 'PASSWORD_CHANGE_REQUIRED', 'Please change your temporary password first'))
  }
  next()
}

// Logged in, temporary password allowed (for /auth/me, /auth/logout, /auth/change-password).
export function requireSession(req, _res, next) {
  if (!req.user) return next(unauthorized())
  next()
}

/** @param {...('editor' | 'admin')} roles */
export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(unauthorized())
    if (!roles.includes(req.user.role)) return next(forbidden())
    next()
  }
