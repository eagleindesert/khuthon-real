import { useState } from 'react'
import type { Comment } from '@/types'
import ActionSheet from '@/components/common/ActionSheet'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import InlineEditor from './InlineEditor'

interface Props {
  comment: Comment
  isOwn: boolean
  onEdit: (commentId: number, text: string) => Promise<void>
  onDelete: (commentId: number) => void
}

export default function CommentItem({ comment, isOwn, onEdit, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const handleSave = async (text: string) => {
    await onEdit(comment.commentId, text)
    setEditing(false)
  }

  const isPending = comment.pending

  return (
    <div
      style={{
        padding: 'var(--space-md) var(--space-lg)',
        opacity: isPending ? 0.6 : 1,
        borderBottom: '1px solid var(--color-outline-variant)',
      }}
    >
      {/* Header: 닉네임 + 커뮤니티 + 타임스탬프 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)' }}>
          {comment.nickname}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 10,
            fontWeight: 'var(--weight-bold)',
            letterSpacing: '0.05em',
            color: 'var(--color-on-surface-variant)',
            background: 'var(--color-surface-container-high)',
            padding: '1px 6px',
            borderRadius: 'var(--radius-full)',
          }}
        >
          {comment.preferredGenre}
        </span>
        <span style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', marginLeft: 'auto' }}>
          {formatRelativeTime(comment.createdAt)}
        </span>
        {isOwn && !editing && (
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="댓글 메뉴"
            style={{ color: 'var(--color-on-surface-variant)', fontSize: 16, padding: '0 4px' }}
          >
            ···
          </button>
        )}
      </div>

      {/* Body */}
      {editing ? (
        <InlineEditor
          initial={comment.content}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-sm)', color: 'var(--color-on-surface)', lineHeight: 1.6 }}>
          {comment.content}
        </p>
      )}

      {/* ··· 메뉴 */}
      <ActionSheet open={menuOpen} onClose={() => setMenuOpen(false)}>
        <button
          onClick={() => { setEditing(true); setMenuOpen(false) }}
          style={menuItemStyle}
        >
          수정
        </button>
        <button
          onClick={() => { setConfirmingDelete(true); setMenuOpen(false) }}
          style={{ ...menuItemStyle, color: 'var(--color-error)' }}
        >
          삭제
        </button>
      </ActionSheet>

      {/* 삭제 확인 */}
      <ConfirmDialog
        open={confirmingDelete}
        message="댓글을 삭제하시겠어요?"
        confirmLabel="삭제"
        danger
        onConfirm={() => { onDelete(comment.commentId); setConfirmingDelete(false) }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  )
}

function parseDate(iso: string): Date {
  // BE가 타임존 없이 KST 시각을 반환하므로 +09:00 보정
  if (iso.endsWith('Z') || iso.includes('+')) return new Date(iso)
  return new Date(iso + '+09:00')
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - parseDate(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return '방금'
  if (mins < 60) return `${mins}분 전`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}시간 전`
  return `${Math.floor(hrs / 24)}일 전`
}

const menuItemStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: 'var(--space-md) var(--space-xl)',
  textAlign: 'left',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-body-lg)',
  color: 'var(--color-on-surface)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
}
