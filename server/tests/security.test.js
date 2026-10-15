import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'
import { ADMIN_ORIGIN, PUBLIC_ORIGIN, api, createTestUser } from './helpers.js'

describe('CORS', () => {
  it('lets the admin panel call any route with cookies', async () => {
    const res = await api().get('/api/auth/me').set('Origin', ADMIN_ORIGIN)
    expect(res.headers['access-control-allow-origin']).toBe(ADMIN_ORIGIN)
    expect(res.headers['access-control-allow-credentials']).toBe('true')
  })

  it('lets the public site read public routes, without cookies', async () => {
    const res = await api().get('/api/health').set('Origin', PUBLIC_ORIGIN)
    expect(res.headers['access-control-allow-origin']).toBe(PUBLIC_ORIGIN)
    expect(res.headers['access-control-allow-credentials']).toBeUndefined()
  })

  it('does not let the public site call admin routes', async () => {
    const res = await api().get('/api/auth/me').set('Origin', PUBLIC_ORIGIN)
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('ignores unknown origins', async () => {
    const res = await api().get('/api/health').set('Origin', 'https://evil.example')
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })
})

describe('origin check on writes (CSRF protection)', () => {
  it('rejects a login posted from another website', async () => {
    const { email, password } = await createTestUser()
    const res = await api().post('/api/auth/login').set('Origin', 'https://evil.example').send({ email, password })
    expect(res.status).toBe(403)
  })

  it('rejects writes from the public site origin too', async () => {
    const { email, password } = await createTestUser()
    const res = await api().post('/api/auth/login').set('Origin', PUBLIC_ORIGIN).send({ email, password })
    expect(res.status).toBe(403)
  })
})

describe('security headers', () => {
  it('sends helmet headers and hides the framework', async () => {
    const res = await api().get('/api/health')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
    expect(res.headers['content-security-policy']).toContain("default-src 'none'")
    expect(res.headers['x-powered-by']).toBeUndefined()
  })
})

describe('login rate limit', () => {
  it('blocks an IP after too many login attempts', async () => {
    const original = env.LOGIN_RATE_LIMIT
    env.LOGIN_RATE_LIMIT = 3
    const limitedApp = createApp() // picks up the lower limit
    env.LOGIN_RATE_LIMIT = original

    const attempt = () =>
      request(limitedApp).post('/api/auth/login').send({ email: 'someone@example.com', password: 'wrong-password' })
    for (let i = 0; i < 3; i++) expect((await attempt()).status).toBe(401)

    const blocked = await attempt()
    expect(blocked.status).toBe(429)
    expect(blocked.body.error.code).toBe('TOO_MANY_REQUESTS')
  })
})
