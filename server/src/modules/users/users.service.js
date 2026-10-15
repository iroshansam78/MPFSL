import { withTransaction } from '../../lib/db.js'
import { conflict, notFound } from '../../lib/errors.js'
import { generateTemporaryPassword, hashPassword } from '../../lib/passwords.js'
import * as audit from '../audit/audit.service.js'
import { deleteUserSessions } from '../auth/sessions.service.js'
import { User } from './user.model.js'

export const MAX_FAILED_LOGINS = 5
export const LOCK_MINUTES = 15

/** @typedef {{ id: string, email: string, role: string }} Actor  the logged-in user making the change */

// ---------- Used by the auth module ----------

export const findByEmailWithPassword = (email) => User.findOne({ email }).select('+passwordHash')

export const findByIdWithPassword = (id) => User.findById(id).select('+passwordHash')

export const findById = (id) => User.findById(id)

/** Counts a wrong password; locks the account after MAX_FAILED_LOGINS in a row. */
export async function recordFailedLogin(userId) {
  const user = await User.findByIdAndUpdate(userId, { $inc: { failedLogins: 1 } }, { returnDocument: 'after' })
  if (user && user.failedLogins >= MAX_FAILED_LOGINS) {
    await User.updateOne(
      { _id: userId },
      { failedLogins: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60 * 1000) },
    )
    return { locked: true }
  }
  return { locked: false }
}

export const recordSuccessfulLogin = (userId) =>
  User.updateOne({ _id: userId }, { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() })

export async function setOwnPassword(userId, newPassword) {
  const passwordHash = await hashPassword(newPassword)
  await User.updateOne({ _id: userId }, { passwordHash, mustChangePassword: false })
}

// ---------- Admin user management ----------

export const listUsers = () => User.find().sort({ role: 1, name: 1 })

/**
 * Creates an account with a temporary password the admin passes on to the new user.
 * @returns {Promise<{ user: any, temporaryPassword: string }>}
 */
export async function createUser({ email, name, role }, /** @type {Actor | null} */ actor) {
  const temporaryPassword = generateTemporaryPassword()
  const user = await User.create({
    email,
    name,
    role,
    passwordHash: await hashPassword(temporaryPassword),
    mustChangePassword: true,
    createdBy: actor?.id ?? null,
  })

  await audit.record({ action: 'user.create', user: actor, target: { type: 'user', id: String(user._id) }, details: { email, role } })
  return { user, temporaryPassword }
}

/**
 * Changes name / role / active. Guards against locking everyone out:
 * - you can't demote or deactivate yourself
 * - there must always be at least one active admin
 */
export async function updateUser(id, changes, /** @type {Actor} */ actor) {
  const user = await withTransaction(async (session) => {
    const target = await User.findById(id).session(session)
    if (!target) throw notFound('User')

    const isSelf = String(target._id) === actor.id
    const losesAdmin =
      target.role === 'admin' && target.active && ((changes.role && changes.role !== 'admin') || changes.active === false)

    if (isSelf && (changes.active === false || (changes.role && changes.role !== target.role))) {
      throw conflict('You can’t change your own role or deactivate your own account')
    }

    if (losesAdmin) {
      const otherAdmins = await User.countDocuments({ _id: { $ne: target._id }, role: 'admin', active: true }).session(
        session,
      )
      if (otherAdmins === 0) throw conflict('There must always be at least one active admin')
    }

    Object.assign(target, changes)
    await target.save({ session })
    return target
  })

  if (changes.active === false) await deleteUserSessions(user._id)

  await audit.record({ action: 'user.update', user: actor, target: { type: 'user', id: String(user._id) }, details: changes })
  return user
}

/** Issues a new temporary password and logs the user out everywhere. */
export async function resetPassword(id, /** @type {Actor} */ actor) {
  const temporaryPassword = generateTemporaryPassword()
  const user = await User.findByIdAndUpdate(
    id,
    {
      passwordHash: await hashPassword(temporaryPassword),
      mustChangePassword: true,
      failedLogins: 0,
      lockedUntil: null,
    },
    { returnDocument: 'after' },
  )
  if (!user) throw notFound('User')

  await deleteUserSessions(user._id)
  await audit.record({ action: 'user.reset_password', user: actor, target: { type: 'user', id: String(user._id) } })
  return { user, temporaryPassword }
}
