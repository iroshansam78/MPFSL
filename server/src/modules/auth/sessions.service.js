import { createHmac, randomBytes } from 'node:crypto'
import { env } from '../../config/env.js'
import { Session } from './session.model.js'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
// Extend a session at most once a minute, so normal browsing doesn't write to the DB on every request.
const TOUCH_INTERVAL_MS = 60 * 1000

export const hashToken = (token) => createHmac('sha256', env.SESSION_SECRET).update(token).digest('hex')

const lifetimeMs = (rememberMe) => (rememberMe ? env.SESSION_REMEMBER_DAYS * DAY : env.SESSION_TTL_HOURS * HOUR)

/** Creates a session and returns the raw token (for the cookie) — it is never stored. */
export async function createSession(userId, { rememberMe = false, userAgent, ip } = {}) {
  const token = randomBytes(32).toString('base64url')
  const now = new Date()
  const expiresAt = new Date(now.getTime() + lifetimeMs(rememberMe))

  await Session.create({
    tokenHash: hashToken(token),
    user: userId,
    rememberMe,
    expiresAt,
    lastSeenAt: now,
    userAgent: userAgent?.slice(0, 300),
    ip,
  })

  return { token, expiresAt, rememberMe }
}

/** Finds a valid session (not expired, user still active) for a cookie token, or null. */
export async function findActiveSession(token) {
  if (!token || typeof token !== 'string' || token.length > 100) return null

  const session = await Session.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } }).populate(
    'user',
  )
  if (!session || !session.user || !session.user.active) return null
  return session
}

/**
 * Slides the expiry forward if the session hasn't been touched for a minute.
 * @returns {Promise<Date | null>} the new expiry if it changed, otherwise null
 */
export async function touchSession(session) {
  const now = Date.now()
  if (now - session.lastSeenAt.getTime() < TOUCH_INTERVAL_MS) return null

  const expiresAt = new Date(now + lifetimeMs(session.rememberMe))
  await Session.updateOne({ _id: session._id }, { lastSeenAt: new Date(now), expiresAt })
  return expiresAt
}

export const deleteSession = (sessionId) => Session.deleteOne({ _id: sessionId })

/** Logs a user out everywhere, optionally keeping one session (the one making the request). */
export function deleteUserSessions(userId, { exceptSessionId } = {}) {
  const filter = { user: userId }
  if (exceptSessionId) filter._id = { $ne: exceptSessionId }
  return Session.deleteMany(filter)
}
