import { altText } from '@mpfsl/shared'
import { badRequest } from '../../lib/errors.js'
import { toMediaResponse } from './media.mapper.js'
import * as mediaService from './media.service.js'

/**
 * POST /admin/media — multipart form: `files` (1–10 images) + one `alt` field per file, in the same order.
 * Files are processed one by one; the response lists what was created. If one file fails, the ones
 * before it are kept and the error says which file failed.
 */
export async function upload(req, res) {
  const files = req.files ?? []
  if (!files.length) throw badRequest('Choose at least one photo to upload')

  const alts = [].concat(req.body?.alt ?? [])
  if (alts.length !== files.length) {
    throw badRequest('Each photo needs a description', { alt: 'Each photo needs a description' })
  }
  const parsedAlts = alts.map((alt, i) => {
    const result = altText.safeParse(alt)
    if (!result.success) {
      throw badRequest(`Description for "${files[i].originalname}": ${result.error.issues[0].message}`, {
        alt: result.error.issues[0].message,
      })
    }
    return result.data
  })

  const created = []
  for (const [i, file] of files.entries()) {
    created.push(await mediaService.createFromUpload(file, parsedAlts[i], req.user))
  }
  res.status(201).json({ media: created.map(toMediaResponse) })
}

export async function list(req, res) {
  const media = await mediaService.list(req.valid.query)
  res.json({ media: media.map(toMediaResponse) })
}

export async function update(req, res) {
  const media = await mediaService.updateAlt(req.valid.params.id, req.valid.body.alt, req.user)
  res.json({ media: toMediaResponse(media) })
}

export async function remove(req, res) {
  await mediaService.remove(req.valid.params.id, req.user)
  res.status(204).end()
}
