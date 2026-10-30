/*
 * Build-time rendering (see scripts/prerender.js): turns each public page into HTML, so search
 * engines, social-media previews and slow phones get real content before any JavaScript runs.
 * The browser then renders the app over it (src/main.jsx).
 */
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from './App.jsx'

export { notFoundPage, pages, pageTitle, pageUrl, SITE_URL } from './data/pages.js'
export { site } from './data/site.js'

export const render = (url) =>
  renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  )
