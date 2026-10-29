// Applies the theme before first paint (saved choice, else the system setting) to avoid a flash.
// Loaded as a normal file (not inline) so the Content-Security-Policy can stay strict.
// Used by both the public site and the admin panel; keep the key in sync with
// src/utils/theme.js and src/admin/lib/theme.js.
;(function () {
  var theme
  try {
    theme = localStorage.getItem('mpfsl-theme')
  } catch {
    // storage blocked — fall back to the system setting
  }
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  document.documentElement.dataset.theme = theme
  // Lets index.html hide the public site's preloader on the admin panel (same check as src/main.jsx)
  if (window.location.hostname.indexOf('admin.') === 0) document.documentElement.dataset.app = 'admin'
})()
