import { useEffect, useRef, useState } from 'react'

interface Props {
  initial: string
  onSave: (text: string) => void
  onCancel: () => void
}

export default function InlineEditor({ initial, onSave, onCancel }: Props) {
  const [text, setText] = useState(initial)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    ref.current?.focus()
    ref.current?.setSelectionRange(text.length, text.length)
  }, [text.length])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        style={{
          background: 'var(--color-surface-container-high)',
          border: '1.5px solid var(--color-primary)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-on-surface)',
          fontSize: 'var(--text-body-sm)',
          padding: 'var(--space-sm) var(--space-md)',
          resize: 'none',
          outline: 'none',
          lineHeight: 1.5,
          width: '100%',
        }}
      />
      <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{ padding: '4px var(--space-md)', borderRadius: 'var(--radius-full)', background: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface)', fontSize: 'var(--text-body-sm)' }}
        >
          취소
        </button>
        <button
          onClick={() => { if (text.trim()) onSave(text.trim()) }}
          disabled={!text.trim() || text.trim() === initial.trim()}
          style={{ padding: '4px var(--space-md)', borderRadius: 'var(--radius-full)', background: 'var(--color-primary)', color: 'var(--color-on-primary)', fontSize: 'var(--text-body-sm)', fontWeight: 'var(--weight-bold)' }}
        >
          저장
        </button>
      </div>
    </div>
  )
}
