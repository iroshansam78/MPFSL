// One-command setup for a database (local, staging or production). Safe to run as often as you like.
//
//   npm run init -- --email you@example.com --name "Your Name"
//
// On Railway (production):
//   railway run --service api npm run init --workspace server -- --email ... --name "..."
//
// Instead of the flags you can set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_NAME in the environment.
//
// What it does:
//   1. checks the database is reachable (and notes whether it supports transactions — required in
//      production, optional on a local standalone MongoDB)
//   2. creates/updates all indexes (unique emails, expiring sessions, ...) — required in production,
//      where the API doesn't build indexes on its own
//   3. creates the first admin account if there is none (prints a one-time temporary password)
import { parseArgs } from 'node:util'
import { email as emailSchema, personName } from '@mpfsl/shared'
import { connectDb, disconnectDb } from '../src/lib/db.js'
import { logger } from '../src/lib/logger.js'
import { checkDatabase, ensureInitialAdmin, syncAllIndexes } from '../src/modules/setup/setup.service.js'

logger.level = 'warn' // keep the script output readable

const { values } = parseArgs({
  options: {
    email: { type: 'string' },
    name: { type: 'string' },
  },
})

const rawEmail = values.email ?? process.env.INITIAL_ADMIN_EMAIL
const rawName = values.name ?? process.env.INITIAL_ADMIN_NAME

const step = (n, text) => console.log(`\n[${n}/3] ${text}`)
const ok = (text) => console.log(`      [OK] ${text}`)
const fail = (text) => {
  console.error(`      [FAIL] ${text}`)
  process.exitCode = 1
}

try {
  step(1, 'Database')
  // Nothing is created on the server until the checks below pass (step 2 creates collections explicitly).
  const connection = await connectDb(undefined, { readOnlyUntilReady: true })
  const db = await checkDatabase()
  ok(`Connected to "${connection.name}" (MongoDB ${db.version})`)
  if (db.transactions) {
    ok(`Transactions supported (replica set "${db.replicaSet ?? 'sharded'}")`)
  } else {
    // Only reachable in development: connectDb refuses a standalone server in production.
    console.log('      [NOTE] Standalone MongoDB: fine for development (changes run without transactions).')
    console.log('             Production must use a replica set, e.g. MongoDB Atlas.')
  }

  step(2, 'Indexes')
  const collections = await syncAllIndexes()
  ok(`Up to date for: ${collections.join(', ')}`)

  step(3, 'Admin account')
  const email = rawEmail === undefined ? undefined : emailSchema.safeParse(rawEmail)
  const name = rawName === undefined ? undefined : personName.safeParse(rawName)
  if (email && !email.success) fail(`"${rawEmail}" is not a valid email address`)
  if (name && !name.success) fail('Name must not be empty')

  if (!process.exitCode) {
    const result = await ensureInitialAdmin({ email: email?.data, name: name?.data })
    if (result.created) {
      ok(`Created admin ${result.user.name} <${result.user.email}>`)
      console.log(`\n      Temporary password: ${result.temporaryPassword}`)
      console.log("      Shown only once. They'll choose their own password at first login.")
    } else {
      ok(`${result.existingAdmins} active admin account(s) already exist - nothing to do`)
      if (rawEmail) console.log('      (To add another admin, use the Users page or `npm run create-admin`.)')
    }
  }
} catch (err) {
  if (err.message !== 'stop') {
    if (err.code === 'BAD_REQUEST') {
      fail(`${err.message}\n        Run: npm run init -- --email you@example.com --name "Your Name"`)
    } else if (err.name === 'MongooseServerSelectionError' || err.name === 'MongoServerSelectionError') {
      fail(`Can't reach MongoDB at MONGODB_URI. Is it running? (${err.message})`)
    } else {
      fail(err.message)
    }
  }
} finally {
  await disconnectDb().catch(() => {})
  console.log(process.exitCode ? '\nSetup did not finish.\n' : '\nSetup complete.\n')
}
