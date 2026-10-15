import { useNavigate } from 'react-router'
import ChangePasswordForm from '../components/forms/ChangePasswordForm.jsx'
import AuthLayout from '../components/layout/AuthLayout.jsx'
import { useLogout } from '../hooks/useAuth.js'
import { useToast } from '../hooks/useToast.js'

// Shown after logging in with a temporary password (new account or admin reset).
function ChangePasswordPage() {
  const navigate = useNavigate()
  const logout = useLogout()
  const toast = useToast()

  return (
    <AuthLayout
      title="Choose your password"
      description="You’re using a temporary password. Choose your own before continuing — only you will know it."
    >
      <ChangePasswordForm
        currentLabel="Temporary password"
        submitLabel="Save and continue"
        onSuccess={() => {
          toast.show({ tone: 'success', message: 'Password saved. Welcome!' })
          navigate('/', { replace: true })
        }}
      />
      <button
        type="button"
        onClick={() => logout.mutate(undefined, { onSettled: () => navigate('/login', { replace: true }) })}
        className="mt-6 text-sm font-semibold text-muted underline-offset-4 hover:text-ink hover:underline"
      >
        Log out instead
      </button>
    </AuthLayout>
  )
}

export default ChangePasswordPage
