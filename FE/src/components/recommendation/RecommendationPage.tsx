import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getList, postReaction, postLike, GENRES } from '@/api'
import type { Genre } from '@/api'
import { resolveYouTubeId } from '@/utils/resolveYouTubeId'
import type { Song } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import CardStack, { CardStackSkeleton } from './CardStack'
import ActionButtons from './ActionButtons'
import CompletionScreen from './CompletionScreen'
import CommentModal from '@/components/comment/CommentModal'

export default function RecommendationPage() {
  const { currentUser } = useAuth()
  const [genre, setGenre] = useState<Genre | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [idx, setIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const loadSongs = useCallback((g: Genre) => {
    setGenre(g)
    setIdx(0)
    setSongs([])
    setError(false)
    setLoading(true)
    setShowHint(true)
    getList(g)
      .then((list) => {
        setSongs(list)
        list.forEach(async (song) => {
          const info = await resolveYouTubeId(song.title, song.artist)
          if (info.videoId) {
            setSongs((prev) =>
              prev.map((s) =>
                s.id === song.id
                  ? { ...s, youtubeVideoId: info.videoId!, ytViews: info.views ?? undefined }
                  : s
              )
            )
          }
        })
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!showHint) return
    const t = setTimeout(() => setShowHint(false), 2200)
    return () => clearTimeout(t)
  }, [showHint])

  const react = (type: 'like' | 'dislike') => {
    const song = songs[idx]
    setIdx((i) => i + 1)
    if (type === 'like' && currentUser?.preferredGenre) {
      postLike(song.id, currentUser.preferredGenre).catch(() => {})
    }
    postReaction(song.id, type).catch(() => {})
  }

  // ── 장르 선택 화면 ──────────────────────────────────────────
  if (!genre) {
    return (
      <div style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: 'var(--space-margin)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-md)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-sm)' }}>
          어떤 음악을 들을까요?
        </h2>
        <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-xl)' }}>
          장르를 선택하면 숨겨진 명곡을 추천해드려요.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', flex: 1 }}>
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => loadSongs(g)}
              style={{
                flex: 1,
                borderRadius: 'var(--radius-xl)',
                border: '1.5px solid var(--color-outline)',
                background: 'var(--color-surface-container)',
                color: 'var(--color-on-surface)',
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-body-lg)',
                fontWeight: 'var(--weight-bold)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 72,
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── 로딩 ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ paddingTop: 'var(--space-xl)' }}>
        <CardStackSkeleton />
      </div>
    )
  }

  // ── 에러 ────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--space-lg)', padding: 'var(--space-margin)' }}>
        <p style={{ fontSize: 48 }}>😢</p>
        <p style={{ color: 'var(--color-on-surface-variant)' }}>곡을 불러오지 못했어요.</p>
        <button
          onClick={() => loadSongs(genre)}
          style={{ padding: 'var(--space-md) var(--space-xl)', borderRadius: 'var(--radius-full)', background: 'var(--color-primary)', color: 'var(--color-on-primary)', fontWeight: 'var(--weight-bold)' }}
        >
          다시 시도
        </button>
        <button
          onClick={() => setGenre(null)}
          style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-on-surface-variant)' }}
        >
          장르 다시 선택
        </button>
      </div>
    )
  }

  // ── 완료 / 카드 없음 ─────────────────────────────────────────
  if (songs.length === 0 || idx >= songs.length) {
    return <CompletionScreen onRestart={() => setGenre(null)} />
  }

  // ── 카드 화면 ────────────────────────────────────────────────
  return (
    <>
      <div
        style={{
          position: 'relative',
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

        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.35 }}
              style={{
                position: 'absolute',
                bottom: 'calc(env(safe-area-inset-bottom, 0px) + 88px)',
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  background: 'rgba(0,0,0,0.62)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 'var(--radius-full)',
                  padding: '10px 24px',
                }}
              >
                <span style={{ fontSize: 20 }}>←</span>
                <span
                  style={{
                    color: '#fff',
                    fontSize: 'var(--text-body-sm)',
                    fontFamily: 'var(--font-body)',
                    letterSpacing: '0.02em',
                  }}
                >
                  스와이프해서 곡을 선택하세요
                </span>
                <span style={{ fontSize: 20 }}>→</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CommentModal
        open={modalOpen}
        songId={songs[idx].id}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
