import { motion } from 'framer-motion'

export default function CompletionScreen() {
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
        오늘의 발굴 완료!
      </h2>
      <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-body-lg)', lineHeight: 1.6 }}>
        오늘의 추천 곡을 모두 들었어요.
        <br />내일 새로운 명곡이 기다리고 있을 거예요.
      </p>
    </motion.div>
  )
}
