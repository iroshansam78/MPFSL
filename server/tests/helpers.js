import request from 'supertest'
import { createApp } from '../src/app.js'
import { hashPassword } from '../src/lib/passwords.js'
import { User } from '../src/modules/users/user.model.js'

export const ADMIN_ORIGIN = 'http://admin.test'
export const PUBLIC_ORIGIN = 'http://site.test'
export const DEFAULT_PASSWORD = 'correct-horse-battery-staple'

export const app = createApp()

let counter = 0

/** Inserts a user directly (bypassing the API) for test setup. */
export async function createTestUser({
  role = 'editor',
  email = `user${++counter}@example.com`,
  name = 'Test User',
  password = DEFAULT_PASSWORD,
  mustChangePassword = false,
  active = true,
} = {}) {
  const user = await User.create({
    email,
    name,
    role,
    active,
    mustChangePassword,
    passwordHash: await hashPassword(password),
  })
  return { user, email, password }
}

/** A supertest agent (keeps cookies, like a browser) logged in as a new user with `role`. */
export async function loginAs(role = 'editor', options = {}) {
  const { user, email, password } = await createTestUser({ role, ...options })
  const agent = request.agent(app)
  const res = await agent.post('/api/auth/login').set('Origin', ADMIN_ORIGIN).send({ email, password })
  if (res.status !== 200) throw new Error(`loginAs failed: ${res.status} ${JSON.stringify(res.body)}`)
  return { agent, user, email, password }
}

export const api = () => request(app)
