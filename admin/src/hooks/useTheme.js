import { useEffect, useState } from 'react'
import { getTheme, setTheme } from '../lib/theme.js'

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
