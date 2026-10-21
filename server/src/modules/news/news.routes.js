import { idParam, newsStatusBody, newsStoryBody, reorderNewsBody } from '@mpfsl/shared'
import { Router } from 'express'
import { requireAuth, requireRole } from '../../middleware/requireAuth.js'
import { validate } from '../../middleware/validate.js'
import * as controller from './news.controller.js'

// /api/news — public, read-only
export const publicNewsRouter = Router().get('/', controller.listPublic)

// /api/admin/news — editors and admins
export const adminNewsRouter = Router()
  .use(requireAuth, requireRole('editor', 'admin'))
  .get('/', controller.listAdmin)
  .post('/', validate({ body: newsStoryBody }), controller.create)
  .put('/order', validate({ body: reorderNewsBody }), controller.reorder)
  .get('/:id', validate({ params: idParam }), controller.get)
  .put('/:id', validate({ params: idParam, body: newsStoryBody }), controller.update)
  .put('/:id/status', validate({ params: idParam, body: newsStatusBody }), controller.setStatus)
  .post('/:id/feature', validate({ params: idParam }), controller.feature)
  .delete('/:id', validate({ params: idParam }), controller.remove)
