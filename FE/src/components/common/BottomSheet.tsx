import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export default function BottomSheet({ open, onClose, children }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 100,
            }}
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'min(100%, 430px)',
              maxHeight: '85dvh',
              background: 'var(--color-surface-container)',
              borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-outline)',
                alignSelf: 'center',
                marginTop: 'var(--space-sm)',
                flexShrink: 0,
              }}
            />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
