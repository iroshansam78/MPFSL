import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

const TONES = {
  error: { box: 'bg-danger-soft text-danger', Icon: XCircle },
  warning: { box: 'bg-warning-soft text-warning', Icon: AlertTriangle },
  success: { box: 'bg-success-soft text-success', Icon: CheckCircle2 },
  info: { box: 'bg-info-soft text-brand', Icon: Info },
}

/** @param {{ tone?: keyof TONES, title?: string, children?: React.ReactNode, className?: string }} props */
function Alert({ tone = 'info', title, children, className = '' }) {
  const { box, Icon } = TONES[tone]
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex gap-3 rounded-lg p-3 text-sm ${box} ${className}`}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="grid gap-0.5">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-ink/90">{children}</div>}
      </div>
    </div>
  )
}

export default Alert
