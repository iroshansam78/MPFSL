import { idParam, mediaListQuery, updateMediaBody, UPLOAD_LIMITS } from '@mpfsl/shared'
import { Router } from 'express'
import multer from 'multer'
import { requireAuth, requireRole } from '../../middleware/requireAuth.js'
import { validate } from '../../middleware/validate.js'
import * as controller from './media.controller.js'

// Files are kept in memory only while they're checked and converted — never written to disk as-is.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: UPLOAD_LIMITS.maxFileBytes,
    files: UPLOAD_LIMITS.maxFilesPerRequest,
    fields: 20,
    fieldSize: 2000,
  },
})

// /api/admin/media — editors and admins
export const adminMediaRouter = Router()
  .use(requireAuth, requireRole('editor', 'admin'))
  .get('/', validate({ query: mediaListQuery }), controller.list)
  .post('/', upload.array('files', UPLOAD_LIMITS.maxFilesPerRequest), controller.upload)
  .patch('/:id', validate({ params: idParam, body: updateMediaBody }), controller.update)
  .delete('/:id', validate({ params: idParam }), controller.remove)
