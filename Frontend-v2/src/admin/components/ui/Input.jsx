const base =
  'h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted/70 transition-colors ' +
  'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20'

export function Input({ className = '', ...props }) {
  return <input className={`${base} ${className}`} {...props} />
}

export function Textarea({ className = '', rows = 4, ...props }) {
  return <textarea rows={rows} className={`${base} h-auto py-2 leading-relaxed ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${base} pr-8 ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Checkbox({ label, className = '', ...props }) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 text-sm text-ink ${className}`}>
      <input type="checkbox" className="size-4 rounded border-line accent-[var(--c-brand)]" {...props} />
      {label}
    </label>
  )
}
