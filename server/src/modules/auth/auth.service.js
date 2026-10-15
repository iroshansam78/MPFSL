import { AppError, badRequest } from '../../lib/errors.js'
import { verifyAgainstDummy, verifyPassword } from '../../lib/passwords.js'
import * as audit from '../audit/audit.service.js'
import * as usersService from '../users/users.service.js'
import { createSession, deleteSession, deleteUserSessions } from './sessions.service.js'

// Same message whether the email doesn't exist or the password is wrong,
// so the login form can't be used to discover which emails have accounts.
const invalidCredentials = () => new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect')

/**
 * @param {{ email: string, password: string, rememberMe: boolean }} credentials
 * @param {{ ip?: string, userAgent?: string }} context
 */
export async function login({ email, password, rememberMe }, { ip, userAgent }) {
  const user = await usersService.findByEmailWithPassword(email)

  if (!user || !user.active) {
    await verifyAgainstDummy(password) // keep the response time the same as a real check
    await audit.record({ action: 'auth.login_failed', email, ip, details: { reason: user ? 'inactive' : 'unknown_email' } })
    throw invalidCredentials()
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000)
    throw new AppError(
      429,
      'ACCOUNT_LOCKED',
      `Too many wrong passwords. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
    )
  }

  if (!(await verifyPassword(user.passwordHash, password))) {
    const { locked } = await usersService.recordFailedLogin(user._id)
    await audit.record({ action: 'auth.login_failed', user: { id: String(user._id), email }, ip, details: { locked } })
    throw invalidCredentials()
  }

  await usersService.recordSuccessfulLogin(user._id)
  user.lastLoginAt = new Date() // reflect the update in the response without re-reading the user
  const session = await createSession(user._id, { rememberMe, ip, userAgent })
  await audit.record({ action: 'auth.login', user: { id: String(user._id), email }, ip })

  return { user, session }
}

export const logout = (sessionId) => deleteSession(sessionId)

/** Changes the logged-in user's password and logs out their other browsers. */
export async function changePassword(actor, sessionId, { currentPassword, newPassword }) {
  const user = await usersService.findByIdWithPassword(actor.id)
  if (!user || !(await verifyPassword(user.passwordHash, currentPassword))) {
    throw badRequest('Current password is incorrect', { currentPassword: 'Current password is incorrect' })
  }

  await usersService.setOwnPassword(user._id, newPassword)
  await deleteUserSessions(user._id, { exceptSessionId: sessionId })
  await audit.record({ action: 'auth.password_change', user: actor })
}
