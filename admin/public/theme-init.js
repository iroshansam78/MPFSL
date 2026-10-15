// Applies the theme before first paint (saved choice, else the system setting) to avoid a flash.
// Loaded as a normal file (not inline) so the Content-Security-Policy can stay strict.
// Keep the storage key in sync with src/lib/theme.js.
;(function () {
  var theme
  try {
    theme = localStorage.getItem('mpfsl-admin-theme')
  } catch {
    // storage blocked — fall back to the system setting
  }
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  document.documentElement.dataset.theme = theme
})()
