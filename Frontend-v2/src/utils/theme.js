// Light/dark theme stored on <html data-theme>. index.html sets it before first paint.
const STORAGE_KEY = 'mpfsl-theme'

export const getTheme = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Storage can be blocked; the theme still applies for this visit.
  }
  window.dispatchEvent(new CustomEvent('themechange', { detail: theme }))
}
