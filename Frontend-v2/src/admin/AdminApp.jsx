import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import AdminRoutes from './AdminRoutes.jsx'
import ToastProvider from './components/ui/ToastProvider.jsx'
import { queryClient } from './lib/queryClient.js'
// Tailwind for the admin panel only — this file is only loaded on admin.website.lk (see src/main.jsx),
// so it never mixes with the public site's styles.
import './styles/admin.css'

function useAdminDocument() {
  useEffect(() => {
    document.title = 'MPFSL Admin'
    // Staff-only: keep out of search engines (the hosting header rule does this too).
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    document.head.appendChild(robots)
    return () => robots.remove()
  }, [])
}

// Root of the admin panel (admin.website.lk).
function AdminApp() {
  useAdminDocument()

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AdminRoutes />
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default AdminApp
