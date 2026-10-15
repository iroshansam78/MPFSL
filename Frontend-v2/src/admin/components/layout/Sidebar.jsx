import { ExternalLink } from 'lucide-react'
import { NavLink } from 'react-router'
import { PUBLIC_SITE_URL } from '../../lib/config.js'
import Logo from './Logo.jsx'
import { NAV_ITEMS } from './navigation.js'

function Sidebar({ user, onNavigate }) {
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || user.role === 'admin')

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-3 px-2 pt-2">
        <Logo className="h-12" />
        <div className="leading-tight">
          <p className="font-display text-lg font-extrabold uppercase">MPFSL</p>
          <p className="text-xs font-semibold tracking-widest text-muted uppercase">Admin</p>
        </div>
      </div>

      <nav aria-label="Main" className="grid gap-1">
        {items.map(({ to, label, icon: Icon, end, soon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive ? 'bg-brand text-on-brand' : 'text-ink hover:bg-surface-2'
              }`
            }
          >
            <Icon className="size-[18px] shrink-0" aria-hidden="true" />
            <span className="flex-1">{label}</span>
            {soon && <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold tracking-wide text-muted uppercase">Soon</span>}
          </NavLink>
        ))}
      </nav>

      <a
        href={PUBLIC_SITE_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-surface-2 hover:text-ink"
      >
        <ExternalLink className="size-4" aria-hidden="true" />
        View public site
      </a>
    </div>
  )
}

export default Sidebar
