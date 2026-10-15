import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { ToastContext } from '../../lib/toastContext.js'

const ICONS = { success: CheckCircle2, error: XCircle, info: Info }
const COLORS = { success: 'text-success', error: 'text-danger', info: 'text-brand' }
let nextId = 1

// Small notifications in the bottom-right corner. Errors stay until closed; others fade after 4s.
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  const show = useCallback(
    ({ tone = 'info', message }) => {
      const id = nextId++
      setToasts((list) => [...list.slice(-3), { id, tone, message }])
      if (tone !== 'error') setTimeout(() => dismiss(id), 4000)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-50 grid w-[min(24rem,calc(100%-2rem))] gap-2" aria-live="polite">
        {toasts.map(({ id, tone, message }) => {
          const Icon = ICONS[tone]
          return (
            <div
              key={id}
              role={tone === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-surface p-3.5 text-sm text-ink shadow-lg"
            >
              <Icon className={`mt-0.5 size-4 shrink-0 ${COLORS[tone]}`} aria-hidden="true" />
              <p className="flex-1">{message}</p>
              <button type="button" onClick={() => dismiss(id)} className="text-muted hover:text-ink" aria-label="Dismiss">
                <X className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider
