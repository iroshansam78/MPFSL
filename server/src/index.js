import { env } from './config/env.js'
import { createApp } from './app.js'
import { connectDb, disconnectDb } from './lib/db.js'
import { logger } from './lib/logger.js'

try {
  await connectDb()
} catch (err) {
  logger.fatal(databaseHelp(err))
  process.exit(1)
}

// A readable explanation instead of a raw driver stack trace when MongoDB can't be reached.
function databaseHelp(err) {
  const uri = env.MONGODB_URI.replace(/\/\/[^@/]*@/, '//***@') // hide credentials
  const lines = [`Can't connect to MongoDB at ${uri}`, `  (${err.message})`]
  if (err.reason?.type === 'ReplicaSetNoPrimary' && /replicaSet=/.test(env.MONGODB_URI)) {
    lines.push(
      '  MONGODB_URI contains "?replicaSet=...", so only a replica set is accepted. A normal local MongoDB',
      '  is standalone: remove "?replicaSet=..." from MONGODB_URI, e.g.',
      '     MONGODB_URI=mongodb://127.0.0.1:27017/mpfsl-dev',
    )
  } else {
    lines.push('  Is MongoDB running, and is MONGODB_URI in server/.env correct?')
  }
  return lines.join('\n')
}

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
