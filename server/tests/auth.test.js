import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { AuditLog } from '../src/modules/audit/audit.model.js'
import { Session } from '../src/modules/auth/session.model.js'
import { ADMIN_ORIGIN, DEFAULT_PASSWORD, api, app, createTestUser, loginAs } from './helpers.js'

const login = (body, agent = api()) => agent.post('/api/auth/login').set('Origin', ADMIN_ORIGIN).send(body)

describe('POST /api/auth/login', () => {
  it('logs in, sets an HttpOnly session cookie and never returns the password hash', async () => {
    const { email, password } = await createTestUser({ role: 'admin', name: 'Asha' })
    const res = await login({ email, password })

    expect(res.status).toBe(200)
    expect(res.body.user).toMatchObject({ email, name: 'Asha', role: 'admin', mustChangePassword: false })
    expect(res.body.user.lastLoginAt).not.toBeNull()
    expect(JSON.stringify(res.body)).not.toContain('passwordHash')

    const cookie = res.headers['set-cookie'][0]
    expect(cookie).toMatch(/^mpfsl_session=/)
    expect(cookie).toMatch(/HttpOnly/i)
    expect(cookie).toMatch(/SameSite=Lax/i)
  })

  it('stores only a hash of the session token', async () => {
    const { email, password } = await createTestUser()
    const res = await login({ email, password })
    const token = res.headers['set-cookie'][0].split(';')[0].split('=')[1]

    const session = await Session.findOne()
    expect(session.tokenHash).not.toBe(token)
    expect(session.tokenHash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('accepts the email in any letter case', async () => {
    const { password } = await createTestUser({ email: 'coach@example.com' })
    const res = await login({ email: '  Coach@Example.COM ', password })
    expect(res.status).toBe(200)
  })

  it('gives the same error for a wrong password and an unknown email', async () => {
    const { email } = await createTestUser()
    const wrongPassword = await login({ email, password: 'not-the-password' })
    const unknownEmail = await login({ email: 'nobody@example.com', password: 'whatever-123' })

    expect(wrongPassword.status).toBe(401)
    expect(unknownEmail.status).toBe(401)
    expect(wrongPassword.body.error).toEqual(unknownEmail.body.error)
    expect(wrongPassword.body.error.code).toBe('INVALID_CREDENTIALS')
  })

  it('returns field errors for invalid input', async () => {
    const res = await login({ email: 'not-an-email', password: '' })
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(res.body.error.fields).toHaveProperty('email')
    expect(res.body.error.fields).toHaveProperty('password')
  })

  it('rejects unknown fields', async () => {
    const { email, password } = await createTestUser()
    const res = await login({ email, password, role: 'admin' })
    expect(res.status).toBe(400)
  })

  it('locks the account after 5 wrong passwords, even for the right password', async () => {
    const { email, password } = await createTestUser()
    for (let i = 0; i < 5; i++) {
      expect((await login({ email, password: `wrong-password-${i}` })).status).toBe(401)
    }

    const res = await login({ email, password })
    expect(res.status).toBe(429)
    expect(res.body.error.code).toBe('ACCOUNT_LOCKED')
  })

  it('refuses deactivated accounts', async () => {
    const { email, password } = await createTestUser({ active: false })
    expect((await login({ email, password })).status).toBe(401)
  })

  it('records successful and failed logins in the audit log', async () => {
    const { email, password } = await createTestUser()
    await login({ email, password: 'wrong-password-1' })
    await login({ email, password })

    const actions = (await AuditLog.find().sort({ createdAt: 1 })).map((entry) => entry.action)
    expect(actions).toEqual(['auth.login_failed', 'auth.login'])
  })
})

describe('session', () => {
  it('GET /me returns the logged-in user', async () => {
    const { agent, email } = await loginAs('editor')
    const res = await agent.get('/api/auth/me')
    expect(res.status).toBe(200)
    expect(res.body.user).toMatchObject({ email, role: 'editor' })
  })

  it('GET /me without a cookie is 401', async () => {
    expect((await api().get('/api/auth/me')).status).toBe(401)
  })

  it('a tampered cookie is treated as logged out', async () => {
    const res = await api().get('/api/auth/me').set('Cookie', 'mpfsl_session=forged-token-value')
    expect(res.status).toBe(401)
  })

  it('logout ends the session', async () => {
    const { agent } = await loginAs('editor')
    expect((await agent.post('/api/auth/logout').set('Origin', ADMIN_ORIGIN)).status).toBe(204)
    expect((await agent.get('/api/auth/me')).status).toBe(401)
    expect(await Session.countDocuments()).toBe(0)
  })
})

describe('temporary passwords', () => {
  it('blocks everything except /me, logout and change-password until the password is changed', async () => {
    const { agent, password } = await loginAs('admin', { mustChangePassword: true })

    expect((await agent.get('/api/auth/me')).status).toBe(200)
    const blocked = await agent.get('/api/admin/users')
    expect(blocked.status).toBe(403)
    expect(blocked.body.error.code).toBe('PASSWORD_CHANGE_REQUIRED')

    const change = await agent
      .post('/api/auth/change-password')
      .set('Origin', ADMIN_ORIGIN)
      .send({ currentPassword: password, newPassword: 'a-brand-new-password' })
    expect(change.status).toBe(204)

    expect((await agent.get('/api/admin/users')).status).toBe(200)
  })
})

describe('POST /api/auth/change-password', () => {
  const change = (agent, body) => agent.post('/api/auth/change-password').set('Origin', ADMIN_ORIGIN).send(body)

  it('requires the correct current password', async () => {
    const { agent } = await loginAs('editor')
    const res = await change(agent, { currentPassword: 'wrong-one-here', newPassword: 'a-brand-new-password' })
    expect(res.status).toBe(400)
    expect(res.body.error.fields).toHaveProperty('currentPassword')
  })

  it('rejects short or common passwords', async () => {
    const { agent } = await loginAs('editor')
    expect((await change(agent, { currentPassword: DEFAULT_PASSWORD, newPassword: 'short' })).status).toBe(400)
    expect((await change(agent, { currentPassword: DEFAULT_PASSWORD, newPassword: 'password123' })).status).toBe(400)
  })

  it('keeps this browser logged in but logs out the others; the new password works', async () => {
    const { agent, email } = await loginAs('editor')
    const otherBrowser = request.agent(app)
    await login({ email, password: DEFAULT_PASSWORD }, otherBrowser)

    expect((await change(agent, { currentPassword: DEFAULT_PASSWORD, newPassword: 'a-brand-new-password' })).status).toBe(204)

    expect((await agent.get('/api/auth/me')).status).toBe(200)
    expect((await otherBrowser.get('/api/auth/me')).status).toBe(401)
    expect((await login({ email, password: DEFAULT_PASSWORD })).status).toBe(401)
    expect((await login({ email, password: 'a-brand-new-password' })).status).toBe(200)
  })
})
