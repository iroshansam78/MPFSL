import { Router } from 'express'
import { requireSession } from '../../middleware/requireAuth.js'
import { validate } from '../../middleware/validate.js'
import * as controller from './auth.controller.js'
import { changePasswordBody, loginBody } from './auth.schemas.js'

// /api/auth — `loginLimiter` is passed in so each app instance gets its own counter.
export function createAuthRouter({ loginLimiter }) {
  return Router()
    .post('/login', loginLimiter, validate({ body: loginBody }), controller.login)
    .post('/logout', requireSession, controller.logout)
    .get('/me', requireSession, controller.me)
    .post('/change-password', requireSession, validate({ body: changePasswordBody }), controller.changePassword)
}
