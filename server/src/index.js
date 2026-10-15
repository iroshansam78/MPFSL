import { env } from './config/env.js'
import { createApp } from './app.js'
import { connectDb, disconnectDb } from './lib/db.js'
import { logger } from './lib/logger.js'

await connectDb()

const server = createApp().listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'API listening')
})

// Railway sends SIGTERM on every redeploy: stop taking new requests, let current ones finish,
// then close the database connection.
let shuttingDown = false
async function shutdown(signal) {
  if (shuttingDown) return
  shuttingDown = true
  logger.info({ signal }, 'Shutting down')

  const forceExit = setTimeout(() => {
    logger.error('Shutdown took too long, exiting')
    process.exit(1)
  }, 10_000)
  forceExit.unref()

  server.close(async () => {
    await disconnectDb()
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('unhandledRejection', (err) => logger.error({ err }, 'Unhandled promise rejection'))
