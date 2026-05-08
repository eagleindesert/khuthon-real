import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import ToastContainer from '@/components/common/ToastContainer'

type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  undoLabel?: string
  onUndo?: () => void
  duration: number
}

interface ToastActions {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  undo: (message: string, onUndo: () => void, label?: string) => void
}

const ToastContext = createContext<ToastActions | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counterRef = useRef(0)

  const add = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = `toast-${++counterRef.current}`
    setToasts((prev) => [...prev, { ...item, id }])
  }, [])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useMemo<ToastActions>(() => ({
    success: (message) => add({ type: 'success', message, duration: 3000 }),
    error:   (message) => add({ type: 'error',   message, duration: 4000 }),
    info:    (message) => add({ type: 'info',    message, duration: 3000 }),
    undo:    (message, onUndo, label = '되돌리기') =>
      add({ type: 'info', message, onUndo, undoLabel: label, duration: 5000 }),
  }), [add])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastActions {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
