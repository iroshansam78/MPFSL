// Runs before every test file: starts an in-memory MongoDB replica set (transactions need one),
// connects Mongoose, and empties the database between tests.
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import { afterAll, afterEach, beforeAll } from 'vitest'

const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } })
process.env.MONGODB_URI = replSet.getUri('mpfsl-test')

const { default: mongoose } = await import('mongoose')
const { connectDb, disconnectDb } = await import('../src/lib/db.js')
await connectDb(process.env.MONGODB_URI)

beforeAll(async () => {
  // Models are registered by now (the test file has imported the app): build unique indexes etc.
  await mongoose.connection.syncIndexes()
})

afterEach(async () => {
  const collections = await mongoose.connection.db.collections()
  await Promise.all(collections.map((collection) => collection.deleteMany({})))
})

afterAll(async () => {
  await disconnectDb()
  await replSet.stop()
})
