// Local development database: a single-node MongoDB replica set (transactions need one) on port 27018.
//
//   npm run dev:db          (keep it running in its own terminal; Ctrl+C to stop)
//
// Data is kept in server/.data/mongo between runs (git-ignored). Runs the MongoDB binary that
// mongodb-memory-server already downloaded for the tests — nothing to install, no admin rights, and it
// doesn't touch any other MongoDB on this machine. Connection string for server/.env:
//
//   MONGODB_URI=mongodb://127.0.0.1:27018/mpfsl-dev?replicaSet=rs0
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { MongoBinary } from 'mongodb-memory-server'
import mongoose from 'mongoose'

const PORT = 27018
const REPLICA_SET = 'rs0'
const serverDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dbPath = path.join(serverDir, '.data', 'mongo')
const firstRun = !existsSync(dbPath)
mkdirSync(dbPath, { recursive: true })

const binary = await MongoBinary.getPath()
const mongod = spawn(binary, ['--replSet', REPLICA_SET, '--port', String(PORT), '--dbpath', dbPath, '--bind_ip', '127.0.0.1', '--quiet'], {
  stdio: ['ignore', 'ignore', 'inherit'],
})
mongod.on('exit', (code) => {
  if (stopping) return
  if (code === 0) {
    console.log('MongoDB was shut down.')
    process.exit(0)
  }
  console.error(`MongoDB exited unexpectedly (code ${code}). Is port ${PORT} already in use by another program?`)
  process.exit(1)
})

// Connect straight to this one server (not via the replica set, which may not exist yet).
const admin = await connectAdmin()

// First run: create the replica set. Later runs: it's already configured in the data folder.
try {
  await admin.command({ replSetGetStatus: 1 })
} catch (err) {
  if (err.codeName !== 'NotYetInitialized') throw err
  await admin.command({ replSetInitiate: { _id: REPLICA_SET, members: [{ _id: 0, host: `127.0.0.1:${PORT}` }] } })
}
await waitForPrimary(admin)

console.log(`\nDev MongoDB running (replica set ${REPLICA_SET}) on port ${PORT}`)
console.log(`Data: ${dbPath}${firstRun ? ' (new)' : ''}`)
console.log(`MONGODB_URI=mongodb://127.0.0.1:${PORT}/mpfsl-dev?replicaSet=${REPLICA_SET}`)
console.log('Press Ctrl+C to stop.\n')

let stopping = false
async function stop() {
  if (stopping) return
  stopping = true
  console.log('Stopping MongoDB...')
  // A proper shutdown flushes everything to disk; mongod exits by itself afterwards.
  await admin.command({ shutdown: 1 }).catch(() => {})
  await Promise.race([new Promise((resolve) => mongod.once('exit', resolve)), sleep(10_000)])
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)

async function connectAdmin() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const connection = await mongoose
        .createConnection(`mongodb://127.0.0.1:${PORT}/?directConnection=true`, { serverSelectionTimeoutMS: 1000 })
        .asPromise()
      return connection.db.admin()
    } catch {
      await sleep(500)
    }
  }
  throw new Error(`MongoDB didn't start on port ${PORT}`)
}

async function waitForPrimary(adminDb) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const hello = await adminDb.command({ hello: 1 })
    if (hello.isWritablePrimary) return
    await sleep(500)
  }
  throw new Error('Replica set did not become ready')
}
