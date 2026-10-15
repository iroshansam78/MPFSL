import { zodResolver } from '@hookform/resolvers/zod'
import { createUserBody } from '@mpfsl/shared'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Alert from '../../components/ui/Alert.jsx'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import { Input, Select } from '../../components/ui/Input.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { useCreateUser } from '../../hooks/useUsers.js'
import { applyServerErrors } from '../../lib/formErrors.js'

const EMPTY = { email: '', name: '', role: 'editor' }

/** @param {{ open: boolean, onClose: () => void, onCreated: (result: { user: object, temporaryPassword: string }) => void }} props */
function CreateUserModal({ open, onClose, onCreated }) {
  const createUser = useCreateUser()
  const [formError, setFormError] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(createUserBody), defaultValues: EMPTY })

  const close = () => {
    reset(EMPTY)
    setFormError(null)
    onClose()
  }

  const onSubmit = (values) => {
    setFormError(null)
    createUser.mutate(values, {
      onSuccess: (result) => {
        reset(EMPTY)
        onCreated(result)
      },
      onError: (error) => setFormError(applyServerErrors(error, setError, ['email', 'name', 'role'])),
    })
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Create account"
      description="They’ll get a temporary password and choose their own when they first log in."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
        {formError && <Alert tone="error">{formError}</Alert>}

        <Field label="Full name" error={errors.name?.message}>
          {(a11y) => <Input autoComplete="off" {...a11y} {...register('name')} />}
        </Field>

        <Field label="Email" error={errors.email?.message}>
          {(a11y) => <Input type="email" autoComplete="off" {...a11y} {...register('email')} />}
        </Field>

        <Field
          label="Role"
          hint="Editors manage news and the gallery. Admins can also manage accounts."
          error={errors.role?.message}
        >
          {(a11y) => (
            <Select {...a11y} {...register('role')}>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </Select>
          )}
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={close} disabled={createUser.isPending}>
            Cancel
          </Button>
          <Button type="submit" loading={createUser.isPending}>
            Create account
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateUserModal
