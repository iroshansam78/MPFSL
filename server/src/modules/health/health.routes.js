import { Router } from 'express'
import { isDbConnected } from '../../lib/db.js'

// /api/health — used by Railway to decide when a new deploy is ready, and by uptime monitors.
export const healthRouter = Router().get('/', (_req, res) => {
  const dbUp = isDbConnected()
  res.status(dbUp ? 200 : 503).json({ ok: dbUp, db: dbUp ? 'up' : 'down' })
})
