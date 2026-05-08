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
}

interface PendingComment extends Comment {
  pending?: boolean
}

export default function CommentModal({ open, songId, onClose }: Props) {
  const { currentUser } = useAuth()
  const toast = useToast()
  const [comments, setComments] = useState<PendingComment[]>([])
  const [loading, setLoading] = useState(false)
  const deleteTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    if (!open) return
    setLoading(true)
    getComments(songId)
      .then((r) => setComments(r.data.items))
      .catch(() => toast.error('댓글을 불러오지 못했어요.'))
      .finally(() => setLoading(false))
  }, [open, songId, toast])

  // 모달 닫힐 때 pending 타이머는 유지 (백그라운드 실행)
  useEffect(() => {
    const timers = deleteTimersRef.current
    return () => {
      timers.forEach((t) => clearTimeout(t))
    }
  }, [])

  const handleSubmit = async (text: string) => {
    if (!currentUser) return
    const tempId = `temp-${Date.now()}`
    const temp: PendingComment = {
      id: tempId as unknown as number,
      songId,
      author: currentUser,
      body: text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pending: true,
    }
    setComments((prev) => [temp, ...prev])
    try {
      const res = await postComment(songId, text)
      setComments((prev) => prev.map((c) => (c.id === temp.id ? { ...res.data } : c)))
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== temp.id))
      toast.error('댓글 전송에 실패했어요.')
    }
  }

  const handleEdit = async (id: number, text: string) => {
    const original = comments.find((c) => c.id === id)
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, body: text } : c)))
    try {
      const res = await putComment(id, text)
      setComments((prev) => prev.map((c) => (c.id === id ? { ...res.data } : c)))
    } catch {
      if (original) setComments((prev) => prev.map((c) => (c.id === id ? original : c)))
      toast.error('댓글 수정에 실패했어요.')
    }
  }

  const handleDelete = (id: number) => {
    const deleted = comments.find((c) => c.id === id)
    setComments((prev) => prev.filter((c) => c.id !== id))

    const timer = setTimeout(async () => {
      deleteTimersRef.current.delete(id)
      try {
        await deleteComment(id)
      } catch {
        if (deleted) setComments((prev) => [deleted, ...prev])
        toast.error('댓글 삭제에 실패했어요.')
      }
    }, 5000)

    deleteTimersRef.current.set(id, timer)

    toast.undo('댓글을 삭제했어요', () => {
      clearTimeout(deleteTimersRef.current.get(id))
      deleteTimersRef.current.delete(id)
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
        currentUserId={currentUser?.userId}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CommentInput songId={songId} onSubmit={handleSubmit} />
    </BottomSheet>
  )
}
