/*
 * Where the public site finds the API (the admin panel has its own copy in admin/lib/config.js):
 *   production   VITE_API_URL, e.g. https://api.mpfsl.lk/api
 *   development  /api, forwarded to the local API by the Vite dev server
 * A production build without VITE_API_URL (no API deployed yet) gets null: the site then shows its
 * built-in news and photos without requesting an address that doesn't exist.
 */
export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : null)
