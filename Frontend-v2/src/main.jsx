import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { removePreloader } from './utils/preloader.js'

/*
 * One app, two addresses:
 *   mpfsl.lk / www.mpfsl.lk  → the public site   (src/App.jsx)
 *   admin.mpfsl.lk           → the admin panel   (src/admin/AdminApp.jsx)
 * In development: http://localhost:5180 and http://admin.localhost:5180.
 *
 * Each half is a separate lazy chunk with its own CSS, so visitors to the public site never
 * download the admin code, and the two style systems (plain CSS vs Tailwind) never meet.
 */
const isAdminHost = window.location.hostname.startsWith('admin.')

// The public site's preloader (index.html) is hidden on the admin host already; drop it from the page.
if (isAdminHost) removePreloader()

const Root = isAdminHost ? lazy(() => import('./admin/AdminApp.jsx')) : lazy(() => import('./App.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Root />
    </Suspense>
  </StrictMode>,
)
