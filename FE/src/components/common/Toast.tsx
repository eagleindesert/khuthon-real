import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { ToastItem } from '@/contexts/ToastContext'

interface Props {
  toast: ToastItem
  onRemove: (id: string) => void
}

const bg: Record<ToastItem['type'], string> = {
  success: 'var(--color-primary)',
  error:   'var(--color-error-container)',
  info:    'var(--color-surface-container-high)',
}

const textColor: Record<ToastItem['type'], string> = {
  success: 'var(--color-on-primary)',
  error:   'var(--color-on-error-container)',
  info:    'var(--color-on-surface)',
}

export default function Toast({ toast, onRemove }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2 }}
      style={{
        pointerEvents: 'auto',
        background: bg[toast.type],
        color: textColor[toast.type],
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-md) var(--space-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-md)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-body-sm)',
        fontWeight: 'var(--weight-medium)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      <span>{toast.message}</span>
      {toast.onUndo && (
        <button
          onClick={() => {
            toast.onUndo?.()
            onRemove(toast.id)
          }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-label-caps)',
            fontWeight: 'var(--weight-bold)',
            letterSpacing: '0.05em',
            color: 'var(--color-primary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
          }}
        >
          {toast.undoLabel}
        </button>
      )}
    </motion.div>
  )
}
