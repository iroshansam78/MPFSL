import { Router } from 'express'
import { createLoginLimiter } from './middleware/rateLimits.js'
import { createAuthRouter } from './modules/auth/auth.routes.js'
import { healthRouter } from './modules/health/health.routes.js'
import { adminMediaRouter } from './modules/media/media.routes.js'
import { adminNewsRouter, publicNewsRouter } from './modules/news/news.routes.js'
import { adminSitePhotosRouter, publicSitePhotosRouter } from './modules/site-photos/sitePhotos.routes.js'
import { adminUsersRouter } from './modules/users/users.routes.js'

// Everything under /api. Add each new module's routers here.
export function createRoutes() {
  return Router()
    .use('/health', healthRouter)
    .use('/auth', createAuthRouter({ loginLimiter: createLoginLimiter() }))
    .use('/news', publicNewsRouter)
    .use('/site-photos', publicSitePhotosRouter)
    .use('/admin/users', adminUsersRouter)
    .use('/admin/media', adminMediaRouter)
    .use('/admin/news', adminNewsRouter)
    .use('/admin/site-photos', adminSitePhotosRouter)
}
