import { z } from 'zod'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../constants.js'
import { email } from './common.js'

// A few passwords too common to allow, whatever their length.
const COMMON_PASSWORDS = new Set([
  'password123',
  'password1234',
  '1234567890',
  '12345678910',
  'qwertyuiop',
  'iloveyou123',
  'admin12345',
  'administrator',
  'welcome123',
  'letmein123',
  'srilanka123',
  'pentathlon',
  'pentathlon1',
  'mpfsl12345',
])

export const newPassword = z
  .string()
  .min(PASSWORD_MIN_LENGTH, { error: `Use at least ${PASSWORD_MIN_LENGTH} characters` })
  .max(PASSWORD_MAX_LENGTH)
  .refine((value) => !COMMON_PASSWORDS.has(value.toLowerCase()), { error: 'This password is too common' })

export const loginBody = z.strictObject({
  email,
  password: z.string().min(1, { error: 'Enter your password' }).max(PASSWORD_MAX_LENGTH),
  rememberMe: z.boolean().optional().default(false),
})

export const changePasswordBody = z
  .strictObject({
    currentPassword: z.string().min(1, { error: 'Enter your current password' }).max(PASSWORD_MAX_LENGTH),
    newPassword,
  })
  .refine((body) => body.newPassword !== body.currentPassword, {
    error: 'Choose a different password from your current one',
    path: ['newPassword'],
  })
