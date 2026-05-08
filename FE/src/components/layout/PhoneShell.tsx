import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function PhoneShell({ children }: Props) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 430,
        height: '100dvh',
        margin: '0 auto',
        overflow: 'hidden',
        background: 'var(--color-surface)',
      }}
    >
      {children}
    </div>
  )
}
