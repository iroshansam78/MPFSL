const dateTime = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
const dateOnly = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' })

export const formatDateTime = (value) => (value ? dateTime.format(new Date(value)) : 'Never')
export const formatDate = (value) => (value ? dateOnly.format(new Date(value)) : '—')

export const roleLabel = (role) => (role === 'admin' ? 'Admin' : 'Editor')
