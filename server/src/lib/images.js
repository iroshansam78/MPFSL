import sharp from 'sharp'
import { badRequest } from './errors.js'

// Sizes every uploaded photo is converted to (longest edge, px). Never upscaled.
export const VARIANTS = {
  thumb: 480, // admin lists, small thumbnails
  medium: 1200, // photo grids, gallery tiles
  large: 2000, // lightbox, featured story
}

const ACCEPTED_FORMATS = new Set(['jpeg', 'png', 'webp', 'heif']) // heif = HEIC/AVIF (what libvips can decode)
const MAX_PIXELS = 50_000_000 // ~50 megapixels: bigger than any camera photo, blocks "decompression bombs"

/**
 * Checks the file really is a supported image (by its content, not its name or MIME type).
 * SVG is never accepted (it can contain scripts).
 * @returns {Promise<import('sharp').Metadata>}
 */
export async function inspectImage(buffer, name = 'This file') {
  let meta
  try {
    meta = await sharp(buffer, { limitInputPixels: MAX_PIXELS }).metadata()
  } catch {
    throw badRequest(`${name} isn't an image we can read. Use JPEG, PNG or WebP.`)
  }

  if (!ACCEPTED_FORMATS.has(meta.format)) {
    throw badRequest(`${name} is a ${meta.format?.toUpperCase() ?? 'unknown'} file. Use JPEG, PNG or WebP.`)
  }
  if (!meta.width || !meta.height) throw badRequest(`${name} has no image size.`)
  if (meta.width * meta.height > MAX_PIXELS) throw badRequest(`${name} is too large (over 50 megapixels).`)
  return meta
}

/**
 * Makes the WebP versions of a photo: turned the right way up (phone orientation), all metadata
 * removed (EXIF, including GPS location), resized to fit each size without upscaling.
 * @returns {Promise<Array<{ name: keyof VARIANTS, buffer: Buffer, width: number, height: number, bytes: number }>>}
 */
export async function makeVariants(buffer) {
  const results = []
  for (const [name, size] of Object.entries(VARIANTS)) {
    let output
    try {
      output = await sharp(buffer, { limitInputPixels: MAX_PIXELS })
        .rotate() // apply EXIF orientation, then the metadata is dropped (sharp's default)
        .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: name === 'thumb' ? 75 : 82 })
        .toBuffer({ resolveWithObject: true })
    } catch {
      throw badRequest('This image could not be processed. Try saving it as JPEG and uploading again.')
    }
    results.push({ name, buffer: output.data, width: output.info.width, height: output.info.height, bytes: output.info.size })
  }
  return results
}
