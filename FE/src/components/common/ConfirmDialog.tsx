import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  open: boolean
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export default function ConfirmDialog({
  open,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
  danger = false,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onCancel}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 300,
            }}
          />
          <motion.div
            key="dialog"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(calc(100% - var(--space-xl) * 2), 320px)',
              background: 'var(--color-surface-container-high)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-xl)',
              zIndex: 301,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-xl)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-body-lg)',
                fontWeight: 'var(--weight-medium)',
                color: 'var(--color-on-surface)',
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              {message}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button
                onClick={onCancel}
                style={{
                  flex: 1,
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-surface-container-highest)',
                  color: 'var(--color-on-surface)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: 'var(--weight-medium)',
                }}
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                style={{
                  flex: 1,
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-full)',
                  background: danger ? 'var(--color-error-container)' : 'var(--color-primary)',
                  color: danger ? 'var(--color-on-error-container)' : 'var(--color-on-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: 'var(--weight-bold)',
                }}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
