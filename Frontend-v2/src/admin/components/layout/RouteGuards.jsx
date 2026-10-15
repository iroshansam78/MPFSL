import { Navigate, Outlet, useLocation } from 'react-router'
import { useMe } from '../../hooks/useAuth.js'
import Alert from '../ui/Alert.jsx'
import Button from '../ui/Button.jsx'
import FullPageSpinner from './FullPageSpinner.jsx'

// Shown if the API can't be reached at all while checking the session.
function ConnectionProblem({ error, onRetry }) {
  return (
    <div className="mx-auto grid min-h-dvh max-w-md place-items-center p-6">
      <div className="grid gap-4">
        <Alert tone="error" title="Can’t load the admin panel">
          {error.message}
        </Alert>
        <Button onClick={onRetry}>Try again</Button>
      </div>
    </div>
  )
}

/**
 * Pages for logged-in staff. Not logged in → /login (and back here afterwards).
 * Temporary password → /change-password first.
 */
export function RequireAuth() {
  const { data: user, isPending, error, refetch } = useMe()
  const location = useLocation()

  if (isPending) return <FullPageSpinner />
  if (error) return <ConnectionProblem error={error} onRetry={refetch} />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (user.mustChangePassword) return <Navigate to="/change-password" replace />
  return <Outlet />
}

/** Admin-only pages. Editors who open the URL directly are sent to the dashboard. */
export function RequireAdmin() {
  const { data: user } = useMe()
  if (user?.role !== 'admin') return <Navigate to="/" replace />
  return <Outlet />
}

/** The login page: already logged-in users go straight in. */
export function GuestOnly() {
  const { data: user, isPending } = useMe()
  if (isPending) return <FullPageSpinner />
  if (user) return <Navigate to={user.mustChangePassword ? '/change-password' : '/'} replace />
  return <Outlet />
}

/** The forced password-change page: only for logged-in users who still have a temporary password. */
export function RequireTemporaryPassword() {
  const { data: user, isPending } = useMe()
  if (isPending) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (!user.mustChangePassword) return <Navigate to="/" replace />
  return <Outlet />
}
