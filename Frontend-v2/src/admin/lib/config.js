// API base URL. Production: set VITE_API_URL=https://api.website.lk/api on Cloudflare Pages.
// Development: leave it unset — "/api" goes through the Vite dev server's proxy (see vite.config.js).
export const API_URL = import.meta.env.VITE_API_URL || '/api'

// The public site is the same app on the address without "admin."
// (admin.website.lk → website.lk, admin.localhost:5180 → localhost:5180)
export const PUBLIC_SITE_URL = `${window.location.protocol}//${window.location.host.replace(/^admin\./, '')}`
