import { useEffect, useRef, useState } from 'react'
import type { Comment } from '@/types'
import { getComments, postComment, putComment, deleteComment } from '@/api'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import BottomSheet from '@/components/common/BottomSheet'
import CommentList from './CommentList'
import CommentInput from './CommentInput'

interface Props {
  open: boolean
  songId: number
  onClose: () => void
  onCommentPosted?: () => void
}

export default function CommentModal({ open, songId, onClose, onCommentPosted }: Props) {
  const { currentUser } = useAuth()
  const toast = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const deleteTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    if (!open) return
    setLoading(true)
    getComments(songId)
      .then((r) => setComments(r.data))
      .catch(() => toast.error('댓글을 불러오지 못했어요.'))
      .finally(() => setLoading(false))
  }, [open, songId, toast])

  useEffect(() => {
    const timers = deleteTimersRef.current
    return () => { timers.forEach((t) => clearTimeout(t)) }
  }, [])

  const handleSubmit = async (text: string) => {
    if (!currentUser) return
    const tempId = -Date.now()
    const temp: Comment = {
      commentId: tempId,
      nickname: currentUser.nickname,
      preferredGenre: currentUser.preferredGenre,
      content: text,
      createdAt: new Date().toISOString(),
      pending: true,
    }
    setComments((prev) => [temp, ...prev])
    try {
      const res = await postComment(songId, text)
      setComments((prev) => prev.map((c) => (c.commentId === tempId ? { ...res.data } : c)))
      onCommentPosted?.()
    } catch {
      setComments((prev) => prev.filter((c) => c.commentId !== tempId))
      toast.error('댓글 전송에 실패했어요.')
    }
  }

  const handleEdit = async (commentId: number, text: string) => {
    const original = comments.find((c) => c.commentId === commentId)
    setComments((prev) => prev.map((c) => (c.commentId === commentId ? { ...c, content: text } : c)))
    try {
      const res = await putComment(commentId, text)
      setComments((prev) => prev.map((c) => (c.commentId === commentId ? { ...res.data } : c)))
    } catch {
      if (original) setComments((prev) => prev.map((c) => (c.commentId === commentId ? original : c)))
      toast.error('댓글 수정에 실패했어요.')
    }
  }

  const handleDelete = (commentId: number) => {
    const deleted = comments.find((c) => c.commentId === commentId)
    setComments((prev) => prev.filter((c) => c.commentId !== commentId))

    const timer = setTimeout(async () => {
      deleteTimersRef.current.delete(commentId)
      try {
        await deleteComment(commentId)
      } catch {
        if (deleted) setComments((prev) => [deleted, ...prev])
        toast.error('댓글 삭제에 실패했어요.')
      }
    }, 5000)

    deleteTimersRef.current.set(commentId, timer)

    toast.undo('댓글을 삭제했어요', () => {
      clearTimeout(deleteTimersRef.current.get(commentId))
      deleteTimersRef.current.delete(commentId)
      if (deleted) setComments((prev) => [deleted, ...prev])
    })
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-sm) var(--space-lg) var(--space-md)',
          borderBottom: '1px solid var(--color-outline-variant)',
          flexShrink: 0,
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-body-lg)',
            fontWeight: 'var(--weight-bold)',
          }}
        >
          댓글 {loading ? '' : comments.length}
        </h3>
        <button onClick={onClose} aria-label="닫기" style={{ fontSize: 20, color: 'var(--color-on-surface-variant)' }}>
          ✕
        </button>
      </div>

      <CommentList
        comments={comments}
        loading={loading}
        currentNickname={currentUser?.nickname}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CommentInput songId={songId} onSubmit={handleSubmit} />
    </BottomSheet>
  )
}
