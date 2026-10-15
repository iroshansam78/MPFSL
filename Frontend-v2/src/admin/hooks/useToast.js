import { useContext } from 'react'
import { ToastContext } from '../lib/toastContext.js'

/** const toast = useToast(); toast.show({ tone: 'success', message: 'Saved' }) */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context
}
