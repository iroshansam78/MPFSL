import { zodResolver } from '@hookform/resolvers/zod'
import { loginBody } from '@mpfsl/shared'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router'
import AuthLayout from '../components/layout/AuthLayout.jsx'
import Alert from '../components/ui/Alert.jsx'
import Button from '../components/ui/Button.jsx'
import Field from '../components/ui/Field.jsx'
import { Checkbox, Input } from '../components/ui/Input.jsx'
import { useLogin } from '../hooks/useAuth.js'
import { applyServerErrors } from '../lib/formErrors.js'

function LoginPage() {
  const login = useLogin()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginBody), defaultValues: { email: '', password: '', rememberMe: false } })

  const onSubmit = (values) => {
    setFormError(null)
    login.mutate(values, {
      onSuccess: (user) => {
        const from = location.state?.from?.pathname
        navigate(user.mustChangePassword ? '/change-password' : from || '/', { replace: true })
      },
      onError: (error) => setFormError(applyServerErrors(error, setError, ['email', 'password'])),
    })
  }

  return (
    <AuthLayout title="Log in" description="Manage news and the photo gallery on the federation website.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
        {formError && <Alert tone="error">{formError}</Alert>}

        <Field label="Email" error={errors.email?.message}>
          {(a11y) => <Input type="email" autoComplete="username" autoFocus {...a11y} {...register('email')} />}
        </Field>

        <Field label="Password" error={errors.password?.message}>
          {(a11y) => <Input type="password" autoComplete="current-password" {...a11y} {...register('password')} />}
        </Field>

        <Checkbox label="Keep me logged in on this device" {...register('rememberMe')} />

        <Button type="submit" size="lg" loading={login.isPending} className="mt-2 w-full">
          Log in
        </Button>

        <p className="text-center text-xs text-muted">Forgot your password? Ask an admin to reset it.</p>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
