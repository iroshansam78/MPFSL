import Spinner from './Spinner.jsx'

const VARIANTS = {
  primary: 'bg-brand text-on-brand hover:bg-brand-hover',
  secondary: 'border border-line bg-surface text-ink hover:bg-surface-2',
  ghost: 'text-ink hover:bg-surface-2',
  danger: 'bg-danger text-on-danger hover:opacity-90',
}

const SIZES = {
  sm: 'h-8 gap-1.5 px-3 text-sm',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-11 gap-2 px-5 text-base',
}

/**
 * @param {{ variant?: keyof VARIANTS, size?: keyof SIZES, loading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
function Button({ variant = 'primary', size = 'md', loading = false, disabled, type = 'button', className = '', children, ...props }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center rounded-lg font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  )
}

export default Button
