import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Port 5180 so it doesn’t clash with the public site (5173) or other local Vite apps.
  // Must match ADMIN_ORIGIN in server/.env.
  server: { port: 5180, strictPort: true },
  preview: { port: 5180, strictPort: true },
})
