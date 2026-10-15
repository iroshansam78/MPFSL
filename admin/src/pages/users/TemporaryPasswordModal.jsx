import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import Alert from '../../components/ui/Alert.jsx'
import Button from '../../components/ui/Button.jsx'
import Modal from '../../components/ui/Modal.jsx'

// Shows a new temporary password exactly once (the server never shows it again).
function TemporaryPasswordModal({ open, onClose, user, password, title }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard blocked: the password is still visible to copy by hand
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={user ? `${user.name} · ${user.email}` : undefined}
      footer={<Button onClick={onClose}>Done</Button>}
    >
      <div className="grid gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 p-3">
          <code className="flex-1 font-mono text-lg font-semibold break-all select-all">{password}</code>
          <Button variant="secondary" size="sm" onClick={copy} aria-label="Copy password">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <Alert tone="warning" title="This is the only time you’ll see this password">
          Give it to them privately (in person or a direct message, not a group chat). They’ll be asked to choose
          their own password the first time they log in.
        </Alert>
      </div>
    </Modal>
  )
}

export default TemporaryPasswordModal
