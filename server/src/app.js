import cookieParser from 'cookie-parser'
import express from 'express'
import { pinoHttp } from 'pino-http'
import { logger } from './lib/logger.js'
import { currentDriver, LOCAL_URL_PREFIX, localUploadsDir } from './lib/storage.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { createApiLimiter } from './middleware/rateLimits.js'
import { securityMiddleware } from './middleware/security.js'
import { loadSession } from './middleware/session.js'
import { createRoutes } from './routes.js'

// Builds the Express app without starting it, so tests can use it directly with supertest.
export function createApp() {
  const app = express()

  app.set('trust proxy', 1) // behind Railway's proxy: needed for Secure cookies and real client IPs
  app.disable('x-powered-by')

  app.use(securityMiddleware())
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/api/health' } }))
  app.use(express.json({ limit: '200kb' }))
  app.use(cookieParser())
  app.use(loadSession)

  // Without R2 (local development), uploaded photos are served from disk by the API itself.
  if (currentDriver === 'local') {
    app.use(LOCAL_URL_PREFIX, express.static(localUploadsDir, { immutable: true, maxAge: '1y', index: false }))
  }

  app.use('/api', createApiLimiter(), createRoutes())

  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}
