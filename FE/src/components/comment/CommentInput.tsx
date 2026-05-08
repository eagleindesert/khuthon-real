import { useEffect, useRef, useState } from 'react'

interface Props {
  songId: number
  onSubmit: (text: string) => Promise<void>
}

const DRAFT_KEY = (songId: number) => `sonic-draft-${songId}`

export default function CommentInput({ songId, onSubmit }: Props) {
  const [text, setText] = useState(() => localStorage.getItem(DRAFT_KEY(songId)) ?? '')
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 텍스트 변경 시 draft 저장
  useEffect(() => {
    if (text) {
      localStorage.setItem(DRAFT_KEY(songId), text)
    } else {
      localStorage.removeItem(DRAFT_KEY(songId))
    }
  }, [text, songId])

  const handleSubmit = async () => {
    const trimmed = text.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    try {
      await onSubmit(trimmed)
      setText('')
      localStorage.removeItem(DRAFT_KEY(songId))
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-sm)',
        padding: 'var(--space-md) var(--space-lg)',
        borderTop: '1px solid var(--color-outline-variant)',
        background: 'var(--color-surface-container)',
        flexShrink: 0,
      }}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="이 곡에 대한 생각을 남겨보세요…"
        rows={1}
        style={{
          flex: 1,
          background: 'var(--color-surface-container-high)',
          border: '1px solid var(--color-outline-variant)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--color-on-surface)',
          fontSize: 'var(--text-body-sm)',
          padding: 'var(--space-sm) var(--space-md)',
          resize: 'none',
          outline: 'none',
          lineHeight: 1.5,
          maxHeight: 120,
          overflowY: 'auto',
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || submitting}
        style={{
          alignSelf: 'flex-end',
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-full)',
          background: text.trim() ? 'var(--color-primary)' : 'var(--color-surface-container-high)',
          color: text.trim() ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        ↑
      </button>
    </div>
  )
}
