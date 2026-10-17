import { z } from 'zod'

// Every setting the API needs. The app refuses to start if one is missing or invalid,
// so problems show up at deploy time instead of in the middle of a request.
// Nothing else in the codebase should read process.env directly.
const commaList = z
  .string()
  .default('')
  .transform((value) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  )

const Env = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  MONGODB_URI: z.string().startsWith('mongodb', { error: 'MONGODB_URI must be a mongodb:// or mongodb+srv:// URI' }),

  // Used to hash session tokens before storing them (a stolen database alone can't be used to log in)
  SESSION_SECRET: z.string().min(32, { error: 'SESSION_SECRET must be at least 32 characters' }),
  SESSION_TTL_HOURS: z.coerce.number().positive().default(8),
  SESSION_REMEMBER_DAYS: z.coerce.number().positive().default(14),

  // Browser origins allowed to call the API
  ADMIN_ORIGIN: z.url(),
  PUBLIC_ORIGINS: commaList,

  // Login brute-force protection (per IP, per 15 minutes)
  LOGIN_RATE_LIMIT: z.coerce.number().int().positive().default(10),

  // Cloudflare R2 — needed from Phase 2 (media uploads); optional until then
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  MEDIA_BASE_URL: z.url().optional(),
})

function loadEnv() {
  // Treat `KEY=` (empty) the same as not set, so blank lines in .env fall back to defaults/optional.
  const values = Object.fromEntries(Object.entries(process.env).filter(([, value]) => value !== ''))
  const result = Env.safeParse(values)
  if (!result.success) {
    const problems = result.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    throw new Error(`Invalid environment configuration:\n${problems.join('\n')}`)
  }
  return result.data
}

export const env = loadEnv()

export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'
