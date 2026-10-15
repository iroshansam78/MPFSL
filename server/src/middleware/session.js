import { clearSessionCookie, SESSION_COOKIE, setSessionCookie } from '../modules/auth/sessionCookie.js'
import { findActiveSession, touchSession } from '../modules/auth/sessions.service.js'

/**
 * Reads the session cookie. If it belongs to a valid session, sets:
 *   req.user    — { id, email, name, role, mustChangePassword }
 *   req.authSession — { id, token }
 * Never rejects a request on its own; requireAuth / requireRole do that.
 */
export async function loadSession(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE]
  if (!token) return next()

  const session = await findActiveSession(token)
  if (!session) {
    clearSessionCookie(res)
    return next()
  }

  const user = session.user
  req.user = {
    id: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  }
  req.authSession = { id: String(session._id), token }

  const newExpiry = await touchSession(session)
  if (newExpiry && session.rememberMe) {
    setSessionCookie(res, token, { expiresAt: newExpiry, rememberMe: true })
  }

  next()
}
