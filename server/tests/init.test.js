import mongoose from 'mongoose'
import { describe, expect, it } from 'vitest'
import { checkDatabase, ensureInitialAdmin, syncAllIndexes } from '../src/modules/setup/setup.service.js'
import { User } from '../src/modules/users/user.model.js'
import { createTestUser } from './helpers.js'

describe('init / setup', () => {
  it('detects that the database supports transactions', async () => {
    const db = await checkDatabase()
    expect(db.transactions).toBe(true)
    expect(db.replicaSet).toEqual(expect.any(String))
  })

  it('creates the unique email and session-expiry indexes', async () => {
    const collections = await syncAllIndexes()
    expect(collections).toEqual(expect.arrayContaining(['users', 'sessions', 'auditlogs']))

    const userIndexes = await mongoose.connection.collection('users').indexes()
    expect(userIndexes.find((i) => i.key.email)?.unique).toBe(true)
    const sessionIndexes = await mongoose.connection.collection('sessions').indexes()
    expect(sessionIndexes.find((i) => i.key.expiresAt)?.expireAfterSeconds).toBe(0)
  })

  it('creates the first admin with a temporary password', async () => {
    const result = await ensureInitialAdmin({ email: 'first@example.com', name: 'First Admin' })
    expect(result.created).toBe(true)
    expect(result.temporaryPassword).toEqual(expect.any(String))
    const user = await User.findOne({ email: 'first@example.com' })
    expect(user).toMatchObject({ role: 'admin', mustChangePassword: true, active: true })
  })

  it('does nothing when an active admin already exists (safe to re-run)', async () => {
    await createTestUser({ role: 'admin' })
    const result = await ensureInitialAdmin({ email: 'another@example.com', name: 'Another' })
    expect(result).toEqual({ created: false, existingAdmins: 1 })
    expect(await User.countDocuments()).toBe(1)
  })

  it('asks for details when there is no admin and none were given', async () => {
    await expect(ensureInitialAdmin({})).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })

  it('a deactivated admin does not count', async () => {
    await createTestUser({ role: 'admin', active: false })
    const result = await ensureInitialAdmin({ email: 'new@example.com', name: 'New Admin' })
    expect(result.created).toBe(true)
  })
})
