import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'

/*
 * One app, two addresses:
 *   website.lk / www.website.lk  → the public site   (src/App.jsx)
 *   admin.website.lk             → the admin panel   (src/admin/AdminApp.jsx)
 * In development: http://localhost:5180 and http://admin.localhost:5180.
 *
 * Each half is a separate lazy chunk with its own CSS, so visitors to the public site never
 * download the admin code, and the two style systems (plain CSS vs Tailwind) never meet.
 */
const isAdminHost = window.location.hostname.startsWith('admin.')

const Root = isAdminHost ? lazy(() => import('./admin/AdminApp.jsx')) : lazy(() => import('./App.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Root />
    </Suspense>
  </StrictMode>,
)
