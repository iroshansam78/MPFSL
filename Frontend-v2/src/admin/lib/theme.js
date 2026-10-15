// Light/dark theme stored on <html data-theme>. public/theme-init.js sets it before first paint (shared with the public site).
const STORAGE_KEY = 'mpfsl-theme'

export const getTheme = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // storage blocked: the theme still applies for this visit
  }
  window.dispatchEvent(new CustomEvent('themechange', { detail: theme }))
}
