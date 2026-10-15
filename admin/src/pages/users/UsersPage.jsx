import { KeyRound, ShieldCheck, UserCheck, UserMinus, UserPlus, UserRound } from 'lucide-react'
import { useState } from 'react'
import Alert from '../../components/ui/Alert.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { useMe } from '../../hooks/useAuth.js'
import { useToast } from '../../hooks/useToast.js'
import { useResetUserPassword, useUpdateUser, useUsers } from '../../hooks/useUsers.js'
import { formatDateTime, roleLabel } from '../../lib/format.js'
import CreateUserModal from './CreateUserModal.jsx'
import TemporaryPasswordModal from './TemporaryPasswordModal.jsx'

// What each row action asks before running, and what it sends.
const ACTIONS = {
  makeAdmin: {
    title: 'Make admin?',
    text: (u) => `${u.name} will be able to create accounts, change roles and reset passwords.`,
    confirm: 'Make admin',
    changes: { role: 'admin' },
    done: (u) => `${u.name} is now an admin`,
  },
  makeEditor: {
    title: 'Make editor?',
    text: (u) => `${u.name} will keep news and gallery access but can no longer manage accounts.`,
    confirm: 'Make editor',
    changes: { role: 'editor' },
    done: (u) => `${u.name} is now an editor`,
  },
  deactivate: {
    title: 'Deactivate account?',
    text: (u) => `${u.name} will be logged out everywhere and won’t be able to log in. You can reactivate them later.`,
    confirm: 'Deactivate',
    tone: 'danger',
    changes: { active: false },
    done: (u) => `${u.name} has been deactivated`,
  },
  activate: {
    title: 'Reactivate account?',
    text: (u) => `${u.name} will be able to log in again with their existing password.`,
    confirm: 'Reactivate',
    changes: { active: true },
    done: (u) => `${u.name} has been reactivated`,
  },
  resetPassword: {
    title: 'Reset password?',
    text: (u) => `${u.name} will be logged out and given a new temporary password. Their current password stops working.`,
    confirm: 'Reset password',
    tone: 'danger',
    done: (u) => `New temporary password created for ${u.name}`,
  },
}

function UsersPage() {
  const { data: me } = useMe()
  const { data: users, isPending, error } = useUsers()
  const updateUser = useUpdateUser()
  const resetPassword = useResetUserPassword()
  const toast = useToast()

  const [createOpen, setCreateOpen] = useState(false)
  const [pending, setPending] = useState(null) // { action, user } awaiting confirmation
  const [newPassword, setNewPassword] = useState(null) // { title, user, password }

  const runPending = () => {
    const { action, user } = pending
    const spec = ACTIONS[action]
    const onError = (err) => {
      setPending(null)
      toast.show({ tone: 'error', message: err.message })
    }

    if (action === 'resetPassword') {
      resetPassword.mutate(user.id, {
        onSuccess: ({ temporaryPassword }) => {
          setPending(null)
          setNewPassword({ title: 'New temporary password', user, password: temporaryPassword })
        },
        onError,
      })
    } else {
      updateUser.mutate(
        { id: user.id, ...spec.changes },
        {
          onSuccess: () => {
            setPending(null)
            toast.show({ tone: 'success', message: spec.done(user) })
          },
          onError,
        },
      )
    }
  }

  const pendingSpec = pending && ACTIONS[pending.action]

  return (
    <>
      <PageHeader
        title="Users"
        description="Staff who can log in to this admin panel."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus className="size-4" aria-hidden="true" />
            Create account
          </Button>
        }
      />

      {isPending && (
        <div className="grid place-items-center py-16 text-muted">
          <Spinner className="size-7" label="Loading users" />
        </div>
      )}
      {error && <Alert tone="error">{error.message}</Alert>}

      {users && (
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
          <ul className="divide-y divide-line">
            {users.map((user) => {
              const isSelf = user.id === me.id
              return (
                <li key={user.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4 sm:px-5">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-maroon/15 font-display text-lg font-extrabold text-maroon"
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </span>

                  <div className="min-w-0 flex-1 basis-56">
                    <p className="flex flex-wrap items-center gap-2 font-semibold">
                      <span className="truncate">{user.name}</span>
                      {isSelf && <span className="text-xs font-normal text-muted">(you)</span>}
                    </p>
                    <p className="truncate text-sm text-muted">{user.email}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={user.role === 'admin' ? 'brand' : 'neutral'}>{roleLabel(user.role)}</Badge>
                    {!user.active && <Badge tone="danger">Deactivated</Badge>}
                    {user.active && user.mustChangePassword && <Badge tone="warning">Temporary password</Badge>}
                  </div>

                  <p className="basis-40 text-xs text-muted">
                    Last login
                    <br />
                    <span className="text-sm text-ink">{formatDateTime(user.lastLoginAt)}</span>
                  </p>

                  {/* You can't change your own role or deactivate yourself (the API refuses too). */}
                  <div className="flex flex-wrap gap-1.5 sm:ml-auto">
                    {!isSelf && user.active && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPending({ action: user.role === 'admin' ? 'makeEditor' : 'makeAdmin', user })}
                      >
                        {user.role === 'admin' ? <UserRound className="size-4" /> : <ShieldCheck className="size-4" />}
                        {user.role === 'admin' ? 'Make editor' : 'Make admin'}
                      </Button>
                    )}
                    {!isSelf && user.active && (
                      <Button variant="ghost" size="sm" onClick={() => setPending({ action: 'resetPassword', user })}>
                        <KeyRound className="size-4" />
                        Reset password
                      </Button>
                    )}
                    {!isSelf && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPending({ action: user.active ? 'deactivate' : 'activate', user })}
                        className={user.active ? 'text-danger' : ''}
                      >
                        {user.active ? <UserMinus className="size-4" /> : <UserCheck className="size-4" />}
                        {user.active ? 'Deactivate' : 'Reactivate'}
                      </Button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <CreateUserModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={({ user, temporaryPassword }) => {
          setCreateOpen(false)
          setNewPassword({ title: 'Account created', user, password: temporaryPassword })
        }}
      />

      <TemporaryPasswordModal
        open={Boolean(newPassword)}
        onClose={() => setNewPassword(null)}
        title={newPassword?.title}
        user={newPassword?.user}
        password={newPassword?.password}
      />

      <ConfirmDialog
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        onConfirm={runPending}
        title={pendingSpec?.title}
        confirmLabel={pendingSpec?.confirm}
        tone={pendingSpec?.tone}
        loading={updateUser.isPending || resetPassword.isPending}
      >
        {pending && pendingSpec.text(pending.user)}
      </ConfirmDialog>
    </>
  )
}

export default UsersPage
