import { Router } from 'express'
import { createLoginLimiter } from './middleware/rateLimits.js'
import { createAuthRouter } from './modules/auth/auth.routes.js'
import { healthRouter } from './modules/health/health.routes.js'
import { adminUsersRouter } from './modules/users/users.routes.js'

// Everything under /api. Add each new module's routers here.
export function createRoutes() {
  return Router()
    .use('/health', healthRouter)
    .use('/auth', createAuthRouter({ loginLimiter: createLoginLimiter() }))
    .use('/admin/users', adminUsersRouter)
}
