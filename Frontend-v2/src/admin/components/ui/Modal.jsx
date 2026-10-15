import { X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'

/**
 * Accessible modal built on the native <dialog> (focus trapping, Esc to close and the backdrop
 * come from the browser).
 */
function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const dialog = useRef(null)
  const titleId = useId()
  const width = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg'

  useEffect(() => {
    const el = dialog.current
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === dialog.current) onClose() // click on the backdrop
      }}
      className={`m-auto w-[calc(100%-2rem)] ${width} rounded-xl border border-line bg-surface p-0 text-ink shadow-2xl`}
    >
      {open && (
        <div className="grid gap-5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="grid gap-1">
              <h2 id={titleId} className="font-display text-2xl font-extrabold uppercase italic">
                {title}
              </h2>
              {description && <p className="text-sm text-muted">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mt-1 -mr-2 rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>
          {children}
          {footer && <div className="flex flex-wrap justify-end gap-2">{footer}</div>}
        </div>
      )}
    </dialog>
  )
}

export default Modal
