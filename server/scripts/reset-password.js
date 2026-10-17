// Gives an account a new temporary password from the command line — for when nobody who can log in
// is able to reset it in the admin panel (e.g. the only admin forgot their password).
//
//   npm run reset-password -- --email you@example.com
//
// On Railway (production):
//   railway run --service api npm run reset-password --workspace server -- --email ...
//
// Prints the new temporary password once; the user must choose their own at the next login.
// Also unlocks the account and logs it out everywhere.
import { parseArgs } from 'node:util'
import { email as emailSchema } from '@mpfsl/shared'
import { connectDb, disconnectDb } from '../src/lib/db.js'
import { logger } from '../src/lib/logger.js'
import { User } from '../src/modules/users/user.model.js'
import { resetPassword } from '../src/modules/users/users.service.js'

logger.level = 'warn' // keep the script output readable

const { values } = parseArgs({ options: { email: { type: 'string' } } })
const email = emailSchema.safeParse(values.email ?? '')
if (!email.success) {
  console.error('Usage: npm run reset-password -- --email you@example.com')
  process.exit(1)
}

try {
  await connectDb()
  const user = await User.findOne({ email: email.data })
  if (!user) {
    const all = await User.find({}, { email: 1 }).sort({ email: 1 })
    console.error(`No account with ${email.data}.`)
    if (all.length) console.error(`Existing accounts: ${all.map((u) => u.email).join(', ')}`)
    process.exitCode = 1
  } else {
    const { temporaryPassword } = await resetPassword(String(user._id), null)
    console.log(`\nNew temporary password for ${user.name} <${user.email}>:`)
    console.log(`  ${temporaryPassword}`)
    console.log("Shown only once. They'll choose their own password at the next login.\n")
  }
} catch (err) {
  console.error(err.message)
  process.exitCode = 1
} finally {
  await disconnectDb()
}
