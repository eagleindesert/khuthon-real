import { useState, useEffect } from 'react'
import { getRanks, GENRES } from '@/api'
import { getComments } from '@/api'
import type { Genre, RankedSong } from '@/api'
import { useAuth } from '@/contexts/AuthContext'
import CommentModal from '@/components/comment/CommentModal'

const PREFERRED_GENRES = ['힙합커뮤', '밴드커뮤', '일반인'] as const
type PreferredGenre = typeof PREFERRED_GENRES[number]

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function RankingPage() {
  const { currentUser } = useAuth()
  const [preferredGenre, setPreferredGenre] = useState<PreferredGenre>(
    (currentUser?.preferredGenre as PreferredGenre) ?? '힙합커뮤'
  )
  const [genre, setGenre] = useState<Genre>('Korean Indie')
  const [ranks, setRanks] = useState<RankedSong[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [selectedSongId, setSelectedSongId] = useState<number | null>(null)
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({})

  useEffect(() => {
    setLoading(true)
    setError(false)
    setCommentCounts({})
    getRanks(preferredGenre, genre)
      .then((list) => {
        setRanks(list)
        Promise.all(
          list.map((item) =>
            getComments(item.songId)
              .then((r) => ({ songId: item.songId, count: r.data.length }))
              .catch(() => ({ songId: item.songId, count: 0 }))
          )
        ).then((results) => {
          setCommentCounts(Object.fromEntries(results.map((r) => [r.songId, r.count])))
        })
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [preferredGenre, genre])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* 헤더 */}
      <div style={{ padding: 'var(--space-xl) var(--space-margin) var(--space-md)', flexShrink: 0 }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-headline-md)',
            fontWeight: 'var(--weight-bold)',
            marginBottom: 'var(--space-lg)',
          }}
        >
          랭킹
        </h2>

        {/* 장르 필터 */}
        <SelectorRow>
          {GENRES.map((g) => (
            <Pill key={g} active={g === genre} onClick={() => setGenre(g)}>
              {g}
            </Pill>
          ))}
        </SelectorRow>

        {/* 커뮤니티 필터 */}
        <SelectorRow>
          {PREFERRED_GENRES.map((pg) => (
            <Pill key={pg} active={pg === preferredGenre} onClick={() => setPreferredGenre(pg)}>
              {pg}
            </Pill>
          ))}
        </SelectorRow>
      </div>

      {/* 리스트 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 var(--space-margin) var(--space-xl)' }}>
        {loading && <LoadingRows />}
        {!loading && error && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-md)',
              paddingTop: 'var(--space-xxl)',
            }}
          >
            <p style={{ fontSize: 40 }}>😢</p>
            <p style={{ color: 'var(--color-on-surface-variant)' }}>랭킹을 불러오지 못했어요.</p>
          </div>
        )}
        {!loading && !error && ranks.length === 0 && (
          <p
            style={{
              textAlign: 'center',
              paddingTop: 'var(--space-xxl)',
              color: 'var(--color-on-surface-variant)',
            }}
          >
            아직 랭킹 데이터가 없어요.
          </p>
        )}
        {!loading && !error && ranks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {ranks.map((item) => (
              <RankRow
                key={item.songId}
                item={item}
                commentCount={commentCounts[item.songId]}
                onClick={() => setSelectedSongId(item.songId)}
              />
            ))}
          </div>
        )}
      </div>

      <CommentModal
        open={selectedSongId !== null}
        songId={selectedSongId ?? 0}
        onClose={() => setSelectedSongId(null)}
        onCommentPosted={() => {
          if (selectedSongId !== null) {
            setCommentCounts((prev) => ({ ...prev, [selectedSongId]: (prev[selectedSongId] ?? 0) + 1 }))
          }
        }}
      />
    </div>
  )
}

function SelectorRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-xs)',
        overflowX: 'auto',
        paddingBottom: 'var(--space-sm)',
        scrollbarWidth: 'none',
      }}
    >
      {children}
    </div>
  )
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: '6px 14px',
        borderRadius: 'var(--radius-full)',
        border: active ? 'none' : '1.5px solid var(--color-outline)',
        background: active ? 'var(--color-primary)' : 'transparent',
        color: active ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-body-sm)',
        fontWeight: 'var(--weight-bold)',
        cursor: 'pointer',
        transition: 'background 0.15s, color 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

function RankRow({ item, commentCount, onClick }: { item: RankedSong; commentCount?: number; onClick: () => void }) {
  const isTop3 = item.rank <= 3

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        padding: 'var(--space-md) var(--space-lg)',
        borderRadius: 'var(--radius-md)',
        background: isTop3
          ? item.rank === 1
            ? 'rgba(83,224,118,0.12)'
            : 'var(--color-surface-container)'
          : 'var(--color-surface-container)',
        border: item.rank === 1 ? '1px solid rgba(83,224,118,0.35)' : '1px solid transparent',
        cursor: 'pointer',
      }}
    >
      {/* 순위 */}
      <div
        style={{
          width: 32,
          textAlign: 'center',
          flexShrink: 0,
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--weight-bold)',
          fontSize: isTop3 ? 22 : 'var(--text-body-lg)',
          color: isTop3 ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)',
        }}
      >
        {MEDAL[item.rank] ?? item.rank}
      </div>

      {/* 곡 정보 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--weight-bold)',
            fontSize: 'var(--text-body-lg)',
            color: 'var(--color-on-surface)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.title}
        </p>
        <p
          style={{
            fontSize: 'var(--text-body-sm)',
            color: 'var(--color-on-surface-variant)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.artist}
        </p>
      </div>

      {/* 좋아요 수 + 댓글 수 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: item.likeCount > 0 ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--weight-bold)',
            fontSize: 'var(--text-body-sm)',
          }}
        >
          <span>♥</span>
          <span>{item.likeCount}</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: 'var(--color-on-surface-variant)',
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-body-sm)',
          }}
        >
          <span>💬</span>
          <span>{commentCount ?? '…'}</span>
        </div>
      </div>
    </div>
  )
}

function LoadingRows() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 64,
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface-container)',
            opacity: 1 - i * 0.09,
            animation: 'pulse 1.4s ease-in-out infinite',
          }}
        />
      ))}
    </div>
  )
}
