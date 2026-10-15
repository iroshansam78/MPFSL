import { describe, expect, it } from 'vitest'
import { User } from '../src/modules/users/user.model.js'
import { ADMIN_ORIGIN, api, createTestUser, loginAs } from './helpers.js'

const send = (agent, method, url, body) => agent[method](url).set('Origin', ADMIN_ORIGIN).send(body)

describe('access to /api/admin/users', () => {
  it('needs a login', async () => {
    expect((await api().get('/api/admin/users')).status).toBe(401)
  })

  it('is forbidden for editors', async () => {
    const { agent } = await loginAs('editor')
    const res = await agent.get('/api/admin/users')
    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN')
    expect((await send(agent, 'post', '/api/admin/users', { email: 'x@example.com', name: 'X' })).status).toBe(403)
  })

  it('lists users for admins, without password hashes', async () => {
    const { agent } = await loginAs('admin')
    await createTestUser({ role: 'editor' })
    const res = await agent.get('/api/admin/users')
    expect(res.status).toBe(200)
    expect(res.body.users).toHaveLength(2)
    expect(JSON.stringify(res.body)).not.toContain('passwordHash')
  })
})

describe('creating editors', () => {
  it('creates an editor with a temporary password they can log in with', async () => {
    const { agent } = await loginAs('admin')
    const res = await send(agent, 'post', '/api/admin/users', { email: 'New.Editor@Example.com', name: 'New Editor' })

    expect(res.status).toBe(201)
    expect(res.body.user).toMatchObject({ email: 'new.editor@example.com', role: 'editor', mustChangePassword: true })
    expect(res.body.temporaryPassword).toEqual(expect.any(String))

    const loginRes = await api()
      .post('/api/auth/login')
      .set('Origin', ADMIN_ORIGIN)
      .send({ email: 'new.editor@example.com', password: res.body.temporaryPassword })
    expect(loginRes.status).toBe(200)
    expect(loginRes.body.user.mustChangePassword).toBe(true)
  })

  it('refuses a duplicate email with 409', async () => {
    const { agent } = await loginAs('admin')
    await createTestUser({ email: 'taken@example.com' })
    const res = await send(agent, 'post', '/api/admin/users', { email: 'taken@example.com', name: 'Someone' })
    expect(res.status).toBe(409)
  })

  it('validates the input', async () => {
    const { agent } = await loginAs('admin')
    const res = await send(agent, 'post', '/api/admin/users', { email: 'bad', name: '', role: 'superuser' })
    expect(res.status).toBe(400)
    expect(Object.keys(res.body.error.fields)).toEqual(expect.arrayContaining(['email', 'name', 'role']))
  })
})

describe('updating users', () => {
  it('can promote an editor and deactivate them (which logs them out)', async () => {
    const { agent } = await loginAs('admin')
    const editor = await loginAs('editor')

    const promote = await send(agent, 'patch', `/api/admin/users/${editor.user.id}`, { role: 'admin' })
    expect(promote.status).toBe(200)
    expect(promote.body.user.role).toBe('admin')

    const deactivate = await send(agent, 'patch', `/api/admin/users/${editor.user.id}`, { active: false })
    expect(deactivate.status).toBe(200)
    expect((await editor.agent.get('/api/auth/me')).status).toBe(401)
  })

  it('an admin cannot demote or deactivate themselves', async () => {
    const { agent, user } = await loginAs('admin')
    expect((await send(agent, 'patch', `/api/admin/users/${user.id}`, { role: 'editor' })).status).toBe(409)
    expect((await send(agent, 'patch', `/api/admin/users/${user.id}`, { active: false })).status).toBe(409)
  })

  it('always keeps at least one active admin', async () => {
    // A second admin, then deactivate them: fine. Then the remaining admin is protected anyway.
    const { agent } = await loginAs('admin')
    const { user: other } = await createTestUser({ role: 'admin' })
    expect((await send(agent, 'patch', `/api/admin/users/${other.id}`, { active: false })).status).toBe(200)
    expect(await User.countDocuments({ role: 'admin', active: true })).toBe(1)
  })

  it('404 for an unknown user, 400 for a malformed id', async () => {
    const { agent } = await loginAs('admin')
    expect((await send(agent, 'patch', '/api/admin/users/65f000000000000000000000', { name: 'X' })).status).toBe(404)
    expect((await send(agent, 'patch', '/api/admin/users/not-an-id', { name: 'X' })).status).toBe(400)
  })

  it('rejects an empty update', async () => {
    const { agent } = await loginAs('admin')
    const { user } = await createTestUser()
    expect((await send(agent, 'patch', `/api/admin/users/${user.id}`, {})).status).toBe(400)
  })
})

describe('resetting passwords', () => {
  it('issues a temporary password, invalidates the old one and logs the user out', async () => {
    const { agent } = await loginAs('admin')
    const editor = await loginAs('editor')

    const res = await send(agent, 'post', `/api/admin/users/${editor.user.id}/reset-password`)
    expect(res.status).toBe(200)
    expect(res.body.user.mustChangePassword).toBe(true)

    expect((await editor.agent.get('/api/auth/me')).status).toBe(401)
    const oldLogin = await api().post('/api/auth/login').send({ email: editor.email, password: editor.password })
    expect(oldLogin.status).toBe(401)
    const newLogin = await api()
      .post('/api/auth/login')
      .send({ email: editor.email, password: res.body.temporaryPassword })
    expect(newLogin.status).toBe(200)
  })
})
