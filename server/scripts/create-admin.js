// Creates an admin account from the command line (there is no public sign-up).
//
//   npm run create-admin -- --email you@example.com --name "Your Name"
//
// On Railway (production):
//   railway run --service api npm run create-admin -- --email ... --name "..."
//
// Prints a temporary password once; the admin must change it at first login.
import { parseArgs } from 'node:util'
import { email as emailSchema, personName } from '@mpfsl/shared'
import { connectDb, disconnectDb } from '../src/lib/db.js'
import { logger } from '../src/lib/logger.js'
import { createUser } from '../src/modules/users/users.service.js'

logger.level = 'warn' // keep the script output readable

const { values } = parseArgs({
  options: {
    email: { type: 'string' },
    name: { type: 'string' },
    role: { type: 'string', default: 'admin' },
  },
})

const email = emailSchema.safeParse(values.email ?? '')
const name = personName.safeParse(values.name ?? '')
if (!email.success || !name.success || !['admin', 'editor'].includes(values.role)) {
  console.error('Usage: npm run create-admin -- --email you@example.com --name "Your Name" [--role admin|editor]')
  process.exit(1)
}

try {
  await connectDb()
  const { user, temporaryPassword } = await createUser({ email: email.data, name: name.data, role: values.role }, null)
  console.log(`\nCreated ${user.role} account for ${user.email}`)
  console.log(`Temporary password: ${temporaryPassword}`)
  console.log('They will be asked to choose their own password at first login.\n')
} catch (err) {
  if (err?.code === 11000) console.error(`An account with ${email.data} already exists.`)
  else console.error(err)
  process.exitCode = 1
} finally {
  await disconnectDb()
}
