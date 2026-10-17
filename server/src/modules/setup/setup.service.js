import mongoose from 'mongoose'
import { badRequest } from '../../lib/errors.js'
import '../../models.js'
import { User } from '../users/user.model.js'
import { createUser } from '../users/users.service.js'

/**
 * Checks the connected MongoDB can run transactions (needs a replica set — Atlas always is one).
 * @returns {Promise<{ version: string, replicaSet: string | null, transactions: boolean }>}
 */
export async function checkDatabase() {
  const admin = mongoose.connection.db.admin()
  const [hello, build] = await Promise.all([admin.command({ hello: 1 }), admin.command({ buildInfo: 1 })])
  const replicaSet = hello.setName ?? null
  const transactions = Boolean(replicaSet) || hello.msg === 'isdbgrid' // replica set or sharded cluster
  return { version: build.version, replicaSet, transactions }
}

/**
 * Creates / updates the indexes defined in every model (unique emails, session expiry, …) and removes
 * indexes that are no longer defined. Safe to run repeatedly.
 * @returns {Promise<string[]>} names of the collections that were synced
 */
export async function syncAllIndexes() {
  const models = Object.values(mongoose.models)
  for (const model of models) {
    await model.createCollection().catch((err) => {
      if (err.codeName !== 'NamespaceExists') throw err
    })
    await model.syncIndexes()
  }
  return models.map((model) => model.collection.collectionName).sort()
}

/**
 * Makes sure there is at least one active admin. If there isn't, creates one from `email` + `name`
 * with a temporary password (changed at first login). Does nothing if an admin already exists.
 * @param {{ email?: string, name?: string }} details
 * @returns {Promise<{ created: false, existingAdmins: number } | { created: true, user: any, temporaryPassword: string }>}
 */
export async function ensureInitialAdmin({ email, name } = {}) {
  const existingAdmins = await User.countDocuments({ role: 'admin', active: true })
  if (existingAdmins > 0) return { created: false, existingAdmins }

  if (!email || !name) {
    throw badRequest('No admin account exists yet. Provide an email and name for the first admin.')
  }

  const { user, temporaryPassword } = await createUser({ email, name, role: 'admin' }, null)
  return { created: true, user, temporaryPassword }
}
