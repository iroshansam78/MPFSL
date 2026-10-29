import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { heroStill } from './src/data/hero.js'

// Starts downloading the hero's still photo (the largest thing on the first screen) straight from
// the HTML, instead of waiting for the JavaScript to ask for it. Same srcset as the <img> in
// Hero.jsx, so the browser picks the same file and uses it from the cache.
const preloadHeroPhoto = () => ({
  name: 'preload-hero-photo',
  transformIndexHtml: () => [
    {
      tag: 'link',
      attrs: {
        rel: 'preload',
        as: 'image',
        href: heroStill.src,
        imagesrcset: heroStill.srcSet,
        imagesizes: heroStill.sizes,
        fetchpriority: 'high',
      },
      injectTo: 'head',
    },
  ],
})

// One app for both addresses (see src/main.jsx). Port 5180 avoids clashing with other local Vite
// apps on the default 5173/5174. In development:
//   public site   http://localhost:5180
//   admin panel   http://admin.localhost:5180   (must match ADMIN_ORIGIN in server/.env)
// Tailwind is only used by the admin panel (src/admin/styles/admin.css).
//
// Requests to /api are forwarded to the API (API_PROXY_TARGET, default http://localhost:8080).
// Browsers treat admin.localhost and localhost as different sites and wouldn't send the login
// cookie to the API directly; going through the dev server keeps it same-origin.
// In production the app calls VITE_API_URL (https://api.mpfsl.lk/api) directly — no proxy.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxy = { '/api': { target: env.API_PROXY_TARGET || 'http://localhost:8080', changeOrigin: true } }

  return {
    plugins: [react(), tailwindcss(), preloadHeroPhoto()],
    server: { port: 5180, strictPort: true, proxy },
    preview: { port: 5180, strictPort: true, proxy },
  }
})
