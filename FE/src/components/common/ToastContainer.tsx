import { AnimatePresence } from 'framer-motion'
import type { ToastItem } from '@/contexts/ToastContext'
import Toast from './Toast'

interface Props {
  toasts: ToastItem[]
  onRemove: (id: string) => void
}

export default function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 'env(safe-area-inset-top, 16px)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(calc(100% - var(--space-lg) * 2), 390px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-sm)',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  )
}
