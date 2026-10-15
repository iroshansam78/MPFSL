import { createContext } from 'react'

/** @type {React.Context<{ show: (toast: { tone?: 'success' | 'error' | 'info', message: string }) => void } | null>} */
export const ToastContext = createContext(null)
