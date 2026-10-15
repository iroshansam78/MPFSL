import { describe, expect, it } from 'vitest'
import { api } from './helpers.js'

describe('GET /api/health', () => {
  it('reports the database as up', async () => {
    const res = await api().get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true, db: 'up' })
  })
})

describe('unknown routes', () => {
  it('return 404 in the standard error format', async () => {
    const res = await api().get('/api/does-not-exist')
    expect(res.status).toBe(404)
    expect(res.body.error).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('reject malformed JSON with 400', async () => {
    const res = await api()
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ')
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('BAD_JSON')
  })
})
