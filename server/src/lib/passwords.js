import { randomInt } from 'node:crypto'
import argon2 from 'argon2'

// argon2id with the library's recommended defaults (memory-hard, slow to brute-force).
export const hashPassword = (password) => argon2.hash(password, { type: argon2.argon2id })

export async function verifyPassword(hash, password) {
  try {
    return await argon2.verify(hash, password)
  } catch {
    return false
  }
}

// A real hash of a random value, used when the email doesn't exist so a failed login takes the
// same time either way (attackers can't tell which emails have accounts by timing).
let dummyHashPromise
export function verifyAgainstDummy(password) {
  dummyHashPromise ??= hashPassword(`dummy-${Date.now()}-${Math.random()}`)
  return dummyHashPromise.then((hash) => verifyPassword(hash, password)).then(() => false)
}

// Readable temporary password for new accounts / resets, e.g. "kite-58-river-31-mango".
const WORDS = [
  'river', 'mango', 'kite', 'lotus', 'tiger', 'cedar', 'harbor', 'falcon', 'orbit', 'pepper',
  'monsoon', 'coral', 'summit', 'saffron', 'lagoon', 'ember', 'bamboo', 'meadow', 'comet', 'canyon',
]
export function generateTemporaryPassword() {
  const part = () => `${WORDS[randomInt(WORDS.length)]}-${randomInt(10, 100)}`
  return `${part()}-${part()}-${WORDS[randomInt(WORDS.length)]}`
}
