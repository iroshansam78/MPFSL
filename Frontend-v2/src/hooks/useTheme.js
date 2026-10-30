import { useSyncExternalStore } from 'react'
import { getTheme, setTheme } from '../utils/theme.js'

const subscribe = (onChange) => {
  window.addEventListener('themechange', onChange)
  return () => window.removeEventListener('themechange', onChange)
}

/*
 * Current theme ('light' | 'dark') plus a toggle; stays in sync if the theme changes elsewhere.
 * Pages are pre-rendered in light mode, so the browser starts from 'light' too while it takes over
 * the pre-rendered HTML (hydration), then switches to the real theme straight after. The page's
 * colours come from CSS and are right from the start; only this button's icon waits.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'light')
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  return { theme, toggleTheme }
}
