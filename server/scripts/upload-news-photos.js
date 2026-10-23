// Moves the news photos that ship with the website (Frontend-v2/public/images/news/) into photo
// storage (Cloudflare R2), and points the stories at the uploaded copies. Run after `npm run init`
// once R2 is set up. Safe to re-run: photos already moved are skipped.
//
//   npm run upload-news-photos
//
// On Railway (production):
//   railway run --service api npm run upload-news-photos --workspace server
//
// The files stay in the website too (the About and Programmes sections use some of them).
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { env } from '../src/config/env.js'
import { connectDb, disconnectDb } from '../src/lib/db.js'
import { logger } from '../src/lib/logger.js'
import '../src/models.js'
import { uploadBuiltInPhotos } from '../src/modules/news/news.service.js'

logger.level = 'warn' // keep the script output readable

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../Frontend-v2/public')

if (env.STORAGE_DRIVER !== 'r2') {
  console.error('R2 isn’t set up (fill in the five R2 settings in .env first), so there is nowhere to move the photos to.')
  process.exit(1)
}

try {
  await connectDb()
  const result = await uploadBuiltInPhotos(
    (src) => readFile(path.join(publicDir, src)),
    (line) => console.log(`  ${line}`),
  )
  console.log(
    result.uploaded
      ? `\nDone: ${result.uploaded} photos uploaded to the "${env.R2_BUCKET}" bucket, ${result.stories} stories updated.`
      : '\nNothing to do: every story already uses uploaded photos.',
  )
} catch (err) {
  console.error(`\nStopped: ${err.message}`)
  console.error('Photos moved before the error are kept; run the command again to continue.')
  process.exitCode = 1
} finally {
  await disconnectDb().catch(() => {})
}
