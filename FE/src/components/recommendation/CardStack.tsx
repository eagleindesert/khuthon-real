import { motion } from 'framer-motion'
import type { Song } from '@/types'
import Card from './Card'
import Skeleton from '@/components/common/Skeleton'

interface Props {
  current: Song
  next?: Song
  onSwipe: (direction: 'like' | 'dislike') => void
}

export default function CardStack({ current, next, onSwipe }: Props) {
  return (
    <div style={{ position: 'relative', padding: '0 var(--space-gutter)' }}>
      {/* Next card (behind, slightly scaled down) */}
      {next && (
        <div
          style={{
            position: 'absolute',
            left: 'calc(var(--space-gutter) + 12px)',
            right: 'calc(var(--space-gutter) + 12px)',
            top: 8,
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        >
          <Card song={next} active={false} />
        </div>
      )}

      {/* Current card — key triggers spring entry on each new song */}
      <motion.div
        key={current.id}
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      >
        <Card song={current} active onSwipe={onSwipe} />
      </motion.div>
    </div>
  )
}

export function CardStackSkeleton() {
  return (
    <div style={{ padding: '0 var(--space-gutter)' }}>
      <div
        style={{
          aspectRatio: '3/4',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 'var(--space-lg)',
          background: 'var(--color-surface-container)',
          gap: 'var(--space-sm)',
        }}
      >
        <Skeleton height={24} width="60%" borderRadius="var(--radius)" />
        <Skeleton height={16} width="40%" borderRadius="var(--radius)" />
        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
          <Skeleton height={20} width={60} borderRadius="var(--radius-full)" />
          <Skeleton height={20} width={60} borderRadius="var(--radius-full)" />
        </div>
      </div>
    </div>
  )
}
