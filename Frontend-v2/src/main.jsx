import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { removePreloader } from './utils/preloader.js'
// Self-hosted fonts for both halves (see styles/fonts.css)
import './styles/fonts.css'

/*
 * One app, two addresses:
 *   mpfsl.lk / www.mpfsl.lk  → the public site   (src/PublicSite.jsx → App.jsx)
 *   admin.mpfsl.lk           → the admin panel   (src/admin/AdminApp.jsx)
 * In development: http://localhost:5180 and http://admin.localhost:5180.
 *
 * Each half is a separate chunk with its own CSS, so visitors to the public site never download
 * the admin code, and the two style systems (plain CSS vs Tailwind) never meet.
 *
 * Public pages arrive pre-rendered (scripts/prerender.js), so React takes over that HTML instead of
 * rebuilding it ("hydration"): nothing on screen is replaced, and the first paint stays the largest
 * one. That only works if the first browser render matches the build exactly — anything that
 * depends on the visitor (theme, reduced motion…) must use a server snapshot; see hooks/useTheme.js.
 * The dev server has an empty #root and renders normally, as does the admin panel (below).
 */
const isAdminHost = window.location.hostname.startsWith('admin.')

// The public site's preloader (index.html) is hidden on the admin host already; drop it from the page.
if (isAdminHost) removePreloader()

// Two separate imports (not one inside a ?: expression) so each gets only its own files preloaded
const loadAdmin = () => import('./admin/AdminApp.jsx')
const loadPublic = () => import('./PublicSite.jsx')

;(isAdminHost ? loadAdmin : loadPublic)().then(({ default: Root }) => {
  const container = document.getElementById('root')
  if (isAdminHost) {
    // The admin host is served the pre-rendered public pages too (one build, see vercel.json):
    // drop their content and CSS, and start the admin panel on an empty page.
    container.replaceChildren()
    document.querySelectorAll('style[data-public-site]').forEach((style) => style.remove())
  }
  // Lay out the page from here on (hidden until now, behind the preloader — see index.html), so
  // effects can measure it and fonts and photos start loading while the preloader is still up.
  document.documentElement.classList.add('app-ready')
  const app = (
    <StrictMode>
      <Root />
    </StrictMode>
  )
  if (container.hasChildNodes()) hydrateRoot(container, app)
  else createRoot(container).render(app)
})
