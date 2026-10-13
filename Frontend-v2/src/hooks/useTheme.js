import { useEffect, useState } from 'react'
import { getTheme, setTheme } from '../utils/theme.js'

// Current theme ('light' | 'dark') plus a toggle; stays in sync if the theme changes elsewhere.
export function useTheme() {
  const [theme, setThemeState] = useState(getTheme)

  useEffect(() => {
    const onChange = (event) => setThemeState(event.detail)
    window.addEventListener('themechange', onChange)
    return () => window.removeEventListener('themechange', onChange)
  }, [])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return { theme, toggleTheme }
}
