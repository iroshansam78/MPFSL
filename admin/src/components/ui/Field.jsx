import { useId } from 'react'

/**
 * Label + control + hint/error, wired up for screen readers.
 * `children` is a function receiving the props to spread on the input: { id, 'aria-invalid', 'aria-describedby' }.
 */
function Field({ label, hint, error, children, className = '' }) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className={`grid gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': [errorId, hintId].filter(Boolean).join(' ') || undefined,
      })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

export default Field
