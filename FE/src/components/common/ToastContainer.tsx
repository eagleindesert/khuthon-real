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
        position: 'absolute',
        top: 'calc(env(safe-area-inset-top, 0px) + var(--space-md))',
        left: 'var(--space-lg)',
        right: 'var(--space-lg)',
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
