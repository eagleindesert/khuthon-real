import { useEffect, useState } from 'react'
import { getRecommendations, postReaction } from '@/api'
import type { Song } from '@/types'
import CardStack, { CardStackSkeleton } from './CardStack'
import ActionButtons from './ActionButtons'
import CompletionScreen from './CompletionScreen'
import CommentModal from '@/components/comment/CommentModal'

export default function RecommendationPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [idx, setIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    getRecommendations()
      .then((r) => setSongs(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const react = async (type: 'like' | 'dislike') => {
    const song = songs[idx]
    setIdx((i) => i + 1)
    try {
      await postReaction(song.id, type)
    } catch {
      // 반응 실패는 조용히 무시 — 사용자 흐름 방해 최소화
    }
  }

  if (loading) {
    return (
      <div style={{ paddingTop: 'var(--space-xl)' }}>
        <CardStackSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--space-lg)', padding: 'var(--space-margin)' }}>
        <p style={{ fontSize: 48 }}>😢</p>
        <p style={{ color: 'var(--color-on-surface-variant)' }}>추천 곡을 불러오지 못했어요.</p>
        <button
          onClick={() => { setError(false); setLoading(true); getRecommendations().then((r) => setSongs(r.data)).catch(() => setError(true)).finally(() => setLoading(false)) }}
          style={{ padding: 'var(--space-md) var(--space-xl)', borderRadius: 'var(--radius-full)', background: 'var(--color-primary)', color: 'var(--color-on-primary)', fontWeight: 'var(--weight-bold)' }}
        >
          다시 시도
        </button>
      </div>
    )
  }

  if (songs.length === 0 || idx >= songs.length) {
    return <CompletionScreen />
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          paddingTop: 'var(--space-xl)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <CardStack
          current={songs[idx]}
          next={songs[idx + 1]}
          onSwipe={(dir) => react(dir)}
        />
        <ActionButtons
          onDislike={() => react('dislike')}
          onComment={() => setModalOpen(true)}
          onLike={() => react('like')}
        />
      </div>

      <CommentModal
        open={modalOpen}
        songId={songs[idx].id}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
