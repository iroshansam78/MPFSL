import ChangePasswordForm from '../components/forms/ChangePasswordForm.jsx'
import Badge from '../components/ui/Badge.jsx'
import Card from '../components/ui/Card.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { useMe } from '../hooks/useAuth.js'
import { useToast } from '../hooks/useToast.js'
import { formatDateTime, roleLabel } from '../lib/format.js'

function AccountPage() {
  const { data: user } = useMe()
  const toast = useToast()

  return (
    <>
      <PageHeader title="My account" />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card title="Profile">
          <dl className="grid gap-4 text-sm">
            <div>
              <dt className="text-muted">Name</dt>
              <dd className="font-semibold">{user.name}</dd>
            </div>
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="font-semibold break-all">{user.email}</dd>
            </div>
            <div>
              <dt className="text-muted">Role</dt>
              <dd className="mt-1">
                <Badge tone={user.role === 'admin' ? 'brand' : 'neutral'}>{roleLabel(user.role)}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-muted">Last login</dt>
              <dd className="font-semibold">{formatDateTime(user.lastLoginAt)}</dd>
            </div>
          </dl>
          <p className="mt-5 text-xs text-muted">To change your name or email, ask an admin.</p>
        </Card>

        <Card title="Change password" description="You’ll stay logged in here; other devices will be logged out.">
          <ChangePasswordForm onSuccess={() => toast.show({ tone: 'success', message: 'Password changed' })} />
        </Card>
      </div>
    </>
  )
}

export default AccountPage
