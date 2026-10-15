import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme.js'

function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex size-10 items-center justify-center rounded-lg border border-line text-ink transition-colors hover:bg-surface-2 ${className}`}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      {theme === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  )
}

export default ThemeToggle
