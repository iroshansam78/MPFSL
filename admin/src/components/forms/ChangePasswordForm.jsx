import { zodResolver } from '@hookform/resolvers/zod'
import { newPassword, PASSWORD_MIN_LENGTH } from '@mpfsl/shared'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useChangePassword } from '../../hooks/useAuth.js'
import { applyServerErrors } from '../../lib/formErrors.js'
import Alert from '../ui/Alert.jsx'
import Button from '../ui/Button.jsx'
import Field from '../ui/Field.jsx'
import { Input } from '../ui/Input.jsx'

// Same password rules as the API (from @mpfsl/shared), plus a "type it again" check.
const schema = z
  .object({
    currentPassword: z.string().min(1, { error: 'Enter your current password' }),
    newPassword,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { error: 'Passwords don’t match', path: ['confirmPassword'] })
  .refine((v) => v.newPassword !== v.currentPassword, {
    error: 'Choose a different password from your current one',
    path: ['newPassword'],
  })

/**
 * @param {{ currentLabel?: string, submitLabel?: string, onSuccess?: () => void }} props
 */
function ChangePasswordForm({ currentLabel = 'Current password', submitLabel = 'Change password', onSuccess }) {
  const changePassword = useChangePassword()
  const [formError, setFormError] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } })

  const onSubmit = ({ currentPassword, newPassword: password }) => {
    setFormError(null)
    changePassword.mutate(
      { currentPassword, newPassword: password },
      {
        onSuccess: () => {
          reset()
          onSuccess?.()
        },
        onError: (error) => setFormError(applyServerErrors(error, setError, ['currentPassword', 'newPassword'])),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
      {formError && <Alert tone="error">{formError}</Alert>}

      <Field label={currentLabel} error={errors.currentPassword?.message}>
        {(a11y) => <Input type="password" autoComplete="current-password" {...a11y} {...register('currentPassword')} />}
      </Field>

      <Field label="New password" hint={`At least ${PASSWORD_MIN_LENGTH} characters. A short sentence works well.`} error={errors.newPassword?.message}>
        {(a11y) => <Input type="password" autoComplete="new-password" {...a11y} {...register('newPassword')} />}
      </Field>

      <Field label="Type the new password again" error={errors.confirmPassword?.message}>
        {(a11y) => <Input type="password" autoComplete="new-password" {...a11y} {...register('confirmPassword')} />}
      </Field>

      <Button type="submit" loading={changePassword.isPending} className="justify-self-start">
        {submitLabel}
      </Button>
    </form>
  )
}

export default ChangePasswordForm
