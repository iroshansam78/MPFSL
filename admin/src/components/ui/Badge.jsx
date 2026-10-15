const TONES = {
  neutral: 'bg-surface-2 text-muted',
  brand: 'bg-info-soft text-brand',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
}

/** @param {{ tone?: keyof TONES, children: React.ReactNode }} props */
function Badge({ tone = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]}`}>
      {children}
    </span>
  )
}

export default Badge
