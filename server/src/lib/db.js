import mongoose from 'mongoose'
import { env, isProduction } from '../config/env.js'
import { logger } from './logger.js'

mongoose.set('strictQuery', true)
// In production indexes are created by `npm run init` (scripts/init.js), not on every API start —
// building indexes on a busy database at boot time can slow it down.
mongoose.set('autoIndex', !isProduction)

// Whether the connected MongoDB can run transactions (replica set or sharded cluster — Atlas always can;
// a plain local install runs "standalone" and can't).
let transactionsSupported = false
export const supportsTransactions = () => transactionsSupported

/**
 * @param {string} [uri]
 * @param {{ readOnlyUntilReady?: boolean }} [options] readOnlyUntilReady: don't let Mongoose create
 *   collections/indexes on connect (used by scripts that must check the server before writing anything)
 */
export async function connectDb(uri = env.MONGODB_URI, { readOnlyUntilReady = false } = {}) {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
    ...(readOnlyUntilReady && { autoCreate: false, autoIndex: false }),
  })

  const hello = await mongoose.connection.db.admin().command({ hello: 1 })
  transactionsSupported = Boolean(hello.setName) || hello.msg === 'isdbgrid'

  if (!transactionsSupported) {
    if (isProduction) {
      await mongoose.disconnect()
      throw new Error('Production needs a MongoDB that supports transactions (a replica set, e.g. MongoDB Atlas).')
    }
    logger.warn(
      'MongoDB is running standalone (no replica set): multi-step changes will run without transactions. ' +
        'Fine for development; production (Atlas) always uses transactions.',
    )
  }

  logger.info({ db: mongoose.connection.name, transactions: transactionsSupported }, 'MongoDB connected')
  return mongoose.connection
}

export async function disconnectDb() {
  await mongoose.disconnect()
}

export const isDbConnected = () => mongoose.connection.readyState === 1

/**
 * Runs `work` inside a MongoDB transaction: either every write succeeds or none do.
 * Retries automatically on transient errors.
 *
 * On a standalone MongoDB (local development only — production refuses to start without transactions)
 * `work` runs without a transaction and receives `undefined` as the session, which Mongoose accepts.
 * @template T
 * @param {(session: import('mongoose').ClientSession | undefined) => Promise<T>} work
 * @returns {Promise<T>}
 */
export async function withTransaction(work) {
  if (!transactionsSupported) return work(undefined)

  const session = await mongoose.startSession()
  try {
    let result
    await session.withTransaction(async () => {
      result = await work(session)
    })
    return result
  } finally {
    await session.endSession()
  }
}
