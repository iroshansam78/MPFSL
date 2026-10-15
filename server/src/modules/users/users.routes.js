import { Router } from 'express'
import { requireAuth, requireRole } from '../../middleware/requireAuth.js'
import { validate } from '../../middleware/validate.js'
import * as controller from './users.controller.js'
import { createUserBody, idParam, updateUserBody } from './users.schemas.js'

// /api/admin/users — admins only
export const adminUsersRouter = Router()
  .use(requireAuth, requireRole('admin'))
  .get('/', controller.list)
  .post('/', validate({ body: createUserBody }), controller.create)
  .patch('/:id', validate({ params: idParam, body: updateUserBody }), controller.update)
  .post('/:id/reset-password', validate({ params: idParam }), controller.resetPassword)
