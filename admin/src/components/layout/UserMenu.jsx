import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useLogout } from '../../hooks/useAuth.js'
import { roleLabel } from '../../lib/format.js'

function UserMenu({ user }) {
  const logout = useLogout()
  const navigate = useNavigate()

  const handleLogout = () =>
    logout.mutate(undefined, { onSettled: () => navigate('/login', { replace: true }) })

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right leading-tight sm:block">
        <p className="text-sm font-semibold">{user.name}</p>
        <p className="text-xs text-muted">{roleLabel(user.role)}</p>
      </div>
      <span
        aria-hidden="true"
        className="inline-flex size-10 items-center justify-center rounded-full bg-maroon/15 font-display text-lg font-extrabold text-maroon"
      >
        {user.name.charAt(0).toUpperCase()}
      </span>
      <button
        type="button"
        onClick={handleLogout}
        disabled={logout.isPending}
        className="inline-flex size-10 items-center justify-center rounded-lg border border-line text-ink transition-colors hover:bg-surface-2"
        aria-label="Log out"
        title="Log out"
      >
        <LogOut className="size-[18px]" />
      </button>
    </div>
  )
}

export default UserMenu
