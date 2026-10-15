import { z } from 'zod'
import { ROLES } from '../constants.js'
import { email, personName } from './common.js'

export const role = z.enum(ROLES, { error: 'Role must be editor or admin' })

export const createUserBody = z.strictObject({
  email,
  name: personName,
  role: role.optional().default('editor'),
})

export const updateUserBody = z
  .strictObject({
    name: personName.optional(),
    role: role.optional(),
    active: z.boolean().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, { error: 'Nothing to update' })
