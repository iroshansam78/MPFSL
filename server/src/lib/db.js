import mongoose from 'mongoose'
import { env } from '../config/env.js'
import { logger } from './logger.js'

mongoose.set('strictQuery', true)

export async function connectDb(uri = env.MONGODB_URI) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 })
  logger.info({ db: mongoose.connection.name }, 'MongoDB connected')
  return mongoose.connection
}

export async function disconnectDb() {
  await mongoose.disconnect()
}

export const isDbConnected = () => mongoose.connection.readyState === 1

/**
 * Runs `work` inside a MongoDB transaction: either every write succeeds or none do.
 * Retries automatically on transient errors. Requires a replica set (Atlas always is).
 * @template T
 * @param {(session: import('mongoose').ClientSession) => Promise<T>} work
 * @returns {Promise<T>}
 */
export async function withTransaction(work) {
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
