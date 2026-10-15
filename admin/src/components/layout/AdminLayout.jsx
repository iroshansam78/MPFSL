import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router'
import { useMe } from '../../hooks/useAuth.js'
import Logo from './Logo.jsx'
import Sidebar from './Sidebar.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import UserMenu from './UserMenu.jsx'

// Sidebar on the left (a slide-in drawer on phones), top bar, and the current page.
function AdminLayout() {
  const { data: user } = useMe()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Close the drawer with Esc
  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (event) => event.key === 'Escape' && setDrawerOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-on-brand">
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh border-r border-line bg-surface lg:block">
        <Sidebar user={user} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close menu" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-line bg-surface shadow-xl">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-3 rounded-lg p-2 text-muted hover:bg-surface-2"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
            <Sidebar user={user} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-line lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <span className="lg:hidden">
            <Logo className="h-9" />
          </span>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
