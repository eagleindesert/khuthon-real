import type { Comment } from '@/types'
import CommentItem from './CommentItem'
import Skeleton from '@/components/common/Skeleton'

interface Props {
  comments: Comment[]
  loading: boolean
  currentUserId?: number
  onEdit: (id: number, text: string) => Promise<void>
  onDelete: (id: number) => void
}

export default function CommentList({ comments, loading, currentUserId, onEdit, onDelete }: Props) {
  if (loading) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-md) var(--space-lg)' }}>
        {[0, 1, 2].map((i) => (
          <CommentSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-md)', color: 'var(--color-on-surface-variant)', padding: 'var(--space-xl)' }}>
        <span style={{ fontSize: 40 }}>💬</span>
        <p style={{ fontSize: 'var(--text-body-sm)' }}>첫 번째 댓글을 남겨보세요</p>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          isOwn={comment.author.id === currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

function CommentSkeleton() {
  return (
    <div style={{ padding: 'var(--space-md) 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
        <Skeleton width={80} height={14} />
        <Skeleton width={40} height={16} borderRadius="var(--radius-full)" />
      </div>
      <Skeleton width="90%" height={14} />
      <Skeleton width="60%" height={14} />
    </div>
  )
}
