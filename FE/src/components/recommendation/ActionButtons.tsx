import { motion } from 'framer-motion'

interface Props {
  onDislike: () => void
  onComment: () => void
  onLike: () => void
}

export default function ActionButtons({ onDislike, onComment, onLike }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 'var(--space-xl)',
        padding: 'var(--space-lg) var(--space-gutter)',
      }}
    >
      <ActionBtn onClick={onDislike} size={56} aria-label="아쉬워요">
        <span style={{ fontSize: 24 }}>✕</span>
      </ActionBtn>
      <ActionBtn onClick={onComment} size={48} aria-label="댓글">
        <span style={{ fontSize: 22 }}>💬</span>
      </ActionBtn>
      <ActionBtn onClick={onLike} size={56} aria-label="좋아요" primary>
        <span style={{ fontSize: 24 }}>♥</span>
      </ActionBtn>
    </div>
  )
}

function ActionBtn({
  children,
  onClick,
  size,
  primary = false,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode
  onClick: () => void
  size: number
  primary?: boolean
  'aria-label'?: string
}) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={ariaLabel}
      whileTap={{ scale: 0.82 }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--radius-full)',
        background: primary ? 'var(--color-primary)' : 'var(--color-surface-container-high)',
        color: primary ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: primary ? 'none' : '1.5px solid var(--color-outline)',
        boxShadow: primary ? '0 4px 16px rgba(83,224,118,0.25)' : 'none',
        cursor: 'pointer',
      }}
    >
      {children}
    </motion.button>
  )
}
