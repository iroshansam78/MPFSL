import { sitePhotoKeyParam, updateSitePhotoBody } from '@mpfsl/shared'
import { Router } from 'express'
import { requireAuth, requireRole } from '../../middleware/requireAuth.js'
import { validate } from '../../middleware/validate.js'
import * as controller from './sitePhotos.controller.js'

// /api/site-photos — public, read-only
export const publicSitePhotosRouter = Router().get('/', controller.listPublic)

// /api/admin/site-photos — editors and admins
export const adminSitePhotosRouter = Router()
  .use(requireAuth, requireRole('editor', 'admin'))
  .get('/', controller.listAdmin)
  .put('/:key', validate({ params: sitePhotoKeyParam, body: updateSitePhotoBody }), controller.update)
  .delete('/:key', validate({ params: sitePhotoKeyParam }), controller.restore)
