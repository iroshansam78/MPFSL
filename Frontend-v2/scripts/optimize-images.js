/*
 * Makes smaller WebP copies of the federation photos in public/images/news/ (480, 960 and 1440 px
 * wide, never wider than the original) and lists them in src/data/responsiveImages.json.
 * <SafeImage> reads that list and offers the copies as a srcset, so phones download ~40–80 KB
 * instead of the 100–400 KB originals. The originals stay: they're the fallback, the lightbox
 * shows them, and the API's `npm run upload-news-photos` uploads them.
 *
 * Run after adding or replacing a photo, and commit the results:   npm run images
 */
import { readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, parse } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const folder = join(root, 'public', 'images', 'news')
const WIDTHS = [480, 960, 1440]

const originals = readdirSync(folder).filter((file) => /\.(jpe?g|png)$/i.test(file))
const list = {}

for (const file of originals) {
  const { name } = parse(file)
  const { width } = await sharp(join(folder, file)).metadata()
  const widths = WIDTHS.filter((w) => w < width)
  if (widths.length === 0 || widths.at(-1) < Math.min(width, WIDTHS.at(-1))) widths.push(Math.min(width, WIDTHS.at(-1)))

  for (const w of widths) {
    await sharp(join(folder, file))
      .rotate()
      .resize({ width: w })
      .webp({ quality: 72, effort: 5 })
      .toFile(join(folder, `${name}-${w}.webp`))
  }
  list[`/images/news/${file}`] = widths
  console.log(`${file} (${width} px) → ${widths.map((w) => `${w}`).join(', ')}`)
}

writeFileSync(join(root, 'src', 'data', 'responsiveImages.json'), JSON.stringify(list, null, 2) + '\n')
console.log(`src/data/responsiveImages.json: ${originals.length} photos`)
