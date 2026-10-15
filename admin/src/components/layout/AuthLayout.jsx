import Logo from './Logo.jsx'
import ThemeToggle from './ThemeToggle.jsx'

// Centred card for the login and "choose a new password" screens.
function AuthLayout({ title, description, children }) {
  return (
    <div className="relative grid min-h-dvh place-items-center px-4 py-12">
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo className="h-20" />
          <p className="text-xs font-bold tracking-[0.2em] text-gold uppercase">MPFSL Admin</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <h1 className="font-display text-3xl font-extrabold uppercase italic">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-6 text-center text-xs text-muted">Modern Pentathlon Federation of Sri Lanka · Staff only</p>
      </div>
    </div>
  )
}

export default AuthLayout
