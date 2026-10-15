import { z } from 'zod'

// A MongoDB ObjectId as a 24-character hex string.
export const objectId = z.string().regex(/^[a-f\d]{24}$/i, { error: 'Invalid id' })

export const idParam = z.strictObject({ id: objectId })

export const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: 'Enter a valid email address' }))
  .pipe(z.string().max(254))

export const personName = z.string().trim().min(1, { error: 'Name is required' }).max(100)
