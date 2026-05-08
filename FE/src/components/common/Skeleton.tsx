import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'

interface Props {
  width?: string | number
  height?: string | number
  borderRadius?: string
  style?: CSSProperties
}

export default function Skeleton({ width = '100%', height = 16, borderRadius = 'var(--radius)', style }: Props) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width,
        height,
        borderRadius,
        background: 'var(--color-surface-container-high)',
        flexShrink: 0,
        ...style,
      }}
    />
  )
}
