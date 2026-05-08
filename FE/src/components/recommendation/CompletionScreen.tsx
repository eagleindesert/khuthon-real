import { motion } from 'framer-motion'

interface Props {
  onRestart?: () => void
}

export default function CompletionScreen({ onRestart }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-margin)',
        textAlign: 'center',
        gap: 'var(--space-lg)',
      }}
    >
      <div style={{ fontSize: 64 }}>🎵</div>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-headline-md)',
          fontWeight: 'var(--weight-bold)',
        }}
      >
        발굴 완료!
      </h2>
      <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-body-lg)', lineHeight: 1.6 }}>
        이 장르의 추천 곡을 모두 들었어요.
      </p>
      {onRestart && (
        <button
          onClick={onRestart}
          style={{
            marginTop: 'var(--space-md)',
            padding: 'var(--space-md) var(--space-xl)',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            fontWeight: 'var(--weight-bold)',
            fontSize: 'var(--text-body-lg)',
            cursor: 'pointer',
          }}
        >
          다른 장르 듣기
        </button>
      )}
    </motion.div>
  )
}
