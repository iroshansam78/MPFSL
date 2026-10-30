/*
 * Writes one HTML file per public page into dist/, plus 404.html and sitemap.xml.
 * Runs after the two Vite builds (see "build" in package.json):
 *   dist/          the normal browser build — dist/index.html is used as the template
 *   dist-ssr/      entry-server.jsx built for Node — renders each page to HTML
 *
 * Each file gets the page's rendered content inside <div id="root">, and its own <title>,
 * description, canonical URL, social-preview tags and breadcrumb structured data.
 * Vercel serves dist/about.html at /about ("cleanUrls" in vercel.json) and 404.html for unknown paths.
 */
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const ssrDir = join(root, 'dist-ssr')

const { render, pages, notFoundPage, pageTitle, pageUrl, SITE_URL } = await import(
  pathToFileURL(join(ssrDir, 'entry-server.js')).href
)
const manifestFile = join(dist, '.vite', 'manifest.json')
const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'))

/*
 * The public site's own chunk (PublicSite.jsx) and everything it imports. Normally its CSS only
 * arrives with its JavaScript, which would show the pre-rendered HTML unstyled for a moment and
 * then jump. So every page carries that CSS itself (inline, below) and starts fetching the
 * JavaScript at once.
 */
function chunkFiles(key, seen = new Set()) {
  if (seen.has(key) || key === 'index.html') return { css: [], js: [] }
  seen.add(key)
  const chunk = manifest[key]
  const files = { css: [...(chunk.css ?? [])], js: [chunk.file] }
  for (const child of chunk.imports ?? []) {
    const more = chunkFiles(child, seen)
    files.css.push(...more.css)
    files.js.push(...more.js)
  }
  return files
}
const publicSite = chunkFiles('src/PublicSite.jsx')

/*
 * CSS goes inline, in <style>: on a phone every stylesheet <link> is another round trip before
 * anything can be drawn. Together it's ~9 KB compressed. (The CSP allows inline styles; scripts
 * stay external.) The fonts CSS that Vite links from index.html is inlined the same way.
 * The public site's CSS is marked data-public-site: the admin panel is served these same files
 * (admin.mpfsl.lk) and removes it, so it can't clash with the admin's own styles (src/main.jsx).
 */
const inlineCss = (file, attributes = '') => `<style${attributes}>${readFileSync(join(dist, file), 'utf8').trim()}</style>`
const publicCss = publicSite.css.map((file) => inlineCss(file, ' data-public-site'))
const preloadJs = publicSite.js.map((file) => `<link rel="modulepreload" href="/${file}" />`).join('\n    ')

// When the public site's JavaScript loads, Vite also loads its CSS unless a <link> to that file is
// already on the page. A *disabled* link counts for Vite, but browsers don't download it.
const skipCssDownload = publicSite.css.map((file) => `<link rel="stylesheet" href="/${file}" disabled />`)

let template = readFileSync(join(dist, 'index.html'), 'utf8')
template = template.replace(/<link rel="stylesheet"[^>]*href="\/(assets\/[^"]+\.css)"[^>]*>/g, (_, file) => inlineCss(file))
template = template.replace(
  '</head>',
  `  ${publicCss.join('\n    ')}\n    ${skipCssDownload.join('\n    ')}\n    ${preloadJs}\n  </head>`,
)

const escape = (text) =>
  String(text).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

// Replaces exactly one match of `pattern` in `html`; fails the build if the template has changed shape.
function replaceOnce(html, pattern, replacement) {
  const matches = html.match(new RegExp(pattern.source, 'g')) ?? []
  if (matches.length !== 1) throw new Error(`prerender: expected one match for ${pattern}, found ${matches.length}`)
  return html.replace(pattern, replacement)
}

const breadcrumbs = (page) =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: page.label, item: pageUrl(page) },
    ],
  })

function pageHtml(page, url) {
  const title = escape(pageTitle(page))
  const description = escape(page.description)
  const isHome = page.path === '/'
  let html = template

  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${title}</title>`)
  html = replaceOnce(html, /(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${description}$2`)
  html = replaceOnce(html, /(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${title}$2`)
  html = replaceOnce(html, /(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${description}$2`)

  if (page.noindex) {
    // Not a real page: no canonical URL, and keep it out of search results
    html = replaceOnce(html, /\s*<link rel="canonical" href="[^"]*" \/>/, '\n    <meta name="robots" content="noindex" />')
    html = replaceOnce(html, /\s*<meta property="og:url" content="[^"]*" \/>/, '')
  } else {
    html = replaceOnce(html, /(<link rel="canonical" href=")[^"]*(")/, `$1${pageUrl(page)}$2`)
    html = replaceOnce(html, /(<meta property="og:url" content=")[^"]*(")/, `$1${pageUrl(page)}$2`)
  }

  if (!isHome) {
    // Only the home page shows the hero photo, so only it should preload it
    html = replaceOnce(html, /\s*<link rel="preload" as="image"[^>]*>/, '')
    if (!page.noindex) {
      html = replaceOnce(html, /<\/head>/, `  <script type="application/ld+json">${breadcrumbs(page)}</script>\n  </head>`)
    }
  }

  // React adds a <link rel="preload"> for every image it renders (both header logos, the hero photo).
  // The template already preloads the one that matters, so drop React's.
  const content = render(url).replace(/<link rel="preload"[^>]*>/g, '')
  return replaceOnce(html, /<div id="root"><\/div>/, `<div id="root">${content}</div>`)
}

const fileFor = (path) => (path === '/' ? 'index.html' : `${path.slice(1)}.html`)

for (const page of pages) {
  writeFileSync(join(dist, fileFor(page.path)), pageHtml(page, page.path))
  console.log(`prerender: ${page.path} → dist/${fileFor(page.path)}`)
}

writeFileSync(join(dist, '404.html'), pageHtml(notFoundPage, '/404'))
console.log('prerender: 404 → dist/404.html')

const today = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url>\n    <loc>${pageUrl(page)}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join('\n')}
</urlset>
`
writeFileSync(join(dist, 'sitemap.xml'), sitemap)
console.log(`prerender: sitemap.xml (${pages.length} pages)`)

// The Node build and the manifest are only needed for this script
rmSync(ssrDir, { recursive: true, force: true })
rmSync(join(dist, '.vite'), { recursive: true, force: true })
