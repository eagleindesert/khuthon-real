import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import type { Song } from '@/types'
import { loadYouTubeApi } from '@/utils/youtubeApi'

interface Props {
  song: Song
  active: boolean
  onSwipe?: (direction: 'like' | 'dislike') => void
}

// 16:9 영상을 3:4 카드에 "object-fit: cover"로 채우는 iframe 너비 비율
// width = (16/9) / (3/4) * 100% ≈ 237%
const VIDEO_COVER_WIDTH = `${(16 / 9 / (3 / 4)) * 100}%`

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `${Math.round(n / 1_000)}K`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return `${n}`
}

export default function Card({ song, active, onSwipe }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YT.Player | null>(null)
  const [isMuted, setIsMuted] = useState(false)

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-18, 18])
  const likeOpacity = useTransform(x, [20, 100], [0, 1])
  const dislikeOpacity = useTransform(x, [-100, -20], [1, 0])

  useEffect(() => {
    if (!active || !song.youtubeVideoId || !containerRef.current) return

    let destroyed = false
    const playerDiv = document.createElement('div')
    containerRef.current.appendChild(playerDiv)

    loadYouTubeApi().then(() => {
      if (destroyed) return
      playerRef.current = new YT.Player(playerDiv, {
        videoId: song.youtubeVideoId,
        playerVars: {
          autoplay: 1,
          mute: 0,
          controls: 0,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (e) => {
            if (destroyed) return
            e.target.playVideo()
            // iframe을 카드에 꽉 차도록 "cover" 스타일 적용
            const iframe = e.target.getIframe()
            Object.assign(iframe.style, {
              position: 'absolute',
              width: VIDEO_COVER_WIDTH,
              height: '100%',
              left: '50%',
              top: '0',
              transform: 'translateX(-50%)',
              border: 'none',
              pointerEvents: 'none',
            })
          },
        },
      })
    })

    return () => {
      destroyed = true
      playerRef.current?.destroy()
      playerRef.current = null
      if (playerDiv.parentNode) playerDiv.parentNode.removeChild(playerDiv)
    }
  }, [song.youtubeVideoId, active])

  const toggleMute = () => {
    if (!playerRef.current) return
    if (isMuted) {
      playerRef.current.unMute()
    } else {
      playerRef.current.mute()
    }
    setIsMuted((m) => !m)
  }

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 80
    const velocityThreshold = 500

    if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      animate(x, 600, { type: 'tween', duration: 0.3, ease: 'easeOut' }).then(() => {
        onSwipe?.('like')
      })
    } else if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      animate(x, -600, { type: 'tween', duration: 0.3, ease: 'easeOut' }).then(() => {
        onSwipe?.('dislike')
      })
    }
  }

  return (
    <motion.div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '3/4',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        background: 'var(--color-surface-container)',
        flexShrink: 0,
        x,
        rotate,
        cursor: active ? 'grab' : 'default',
      }}
      drag={active ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={active ? handleDragEnd : undefined}
      whileDrag={{ cursor: 'grabbing' }}
    >
      {/* 1. 앨범 아트 — 영상 미로드 시 폴백 배경 */}
      {song.albumArtUrl && (
        <img
          src={song.albumArtUrl}
          alt={`${song.title} 앨범 아트`}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}

      {/* 2. YouTube IFrame 컨테이너 — 영상이 앨범아트 위를 덮음 */}
      {song.youtubeVideoId && active && (
        <div
          ref={containerRef}
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* 3. 그라디언트 오버레이 — 영상 위에 입혀 가독성 확보 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)',
        }}
      />

      {/* 4. LIKE / NOPE 도장 */}
      {active && (
        <motion.div
          style={{
            position: 'absolute',
            top: '30%',
            left: 'var(--space-lg)',
            border: '6px solid var(--color-primary)',
            borderRadius: 12,
            padding: '10px 22px',
            background: 'rgba(83,224,118,0.15)',
            transform: 'rotate(-15deg)',
            opacity: likeOpacity,
          }}
        >
          <span
            style={{
              color: 'var(--color-primary)',
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 48,
              letterSpacing: 8,
              textShadow: '0 0 16px rgba(83,224,118,0.7)',
            }}
          >
            LIKE
          </span>
        </motion.div>
      )}
      {active && (
        <motion.div
          style={{
            position: 'absolute',
            top: '30%',
            right: 'var(--space-lg)',
            border: '6px solid #ff5555',
            borderRadius: 12,
            padding: '10px 22px',
            background: 'rgba(255,85,85,0.15)',
            transform: 'rotate(15deg)',
            opacity: dislikeOpacity,
          }}
        >
          <span
            style={{
              color: '#ff5555',
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 48,
              letterSpacing: 8,
              textShadow: '0 0 16px rgba(255,85,85,0.7)',
            }}
          >
            NOPE
          </span>
        </motion.div>
      )}

      {/* 5. 뮤트 토글 */}
      {song.youtubeVideoId && active && (
        <button
          onClick={toggleMute}
          aria-label={isMuted ? '소리 켜기' : '소리 끄기'}
          style={{
            position: 'absolute',
            top: 'var(--space-md)',
            right: 'var(--space-md)',
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-full)',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            zIndex: 1,
          }}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      )}

      {/* 6. 곡 정보 */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 'var(--space-lg)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-headline-md)',
            fontWeight: 'var(--weight-bold)',
            color: '#fff',
            marginBottom: 'var(--space-xs)',
          }}
        >
          {song.title}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body-sm)',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: 'var(--space-sm)',
          }}
        >
          {song.artist}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
          {song.genres && song.genres.length > 0 && (
            <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
              {song.genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-label-caps)',
                    fontWeight: 'var(--weight-bold)',
                    letterSpacing: '0.08em',
                    color: 'var(--color-on-surface-variant)',
                    background: 'rgba(0,0,0,0.4)',
                    padding: '2px var(--space-sm)',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          )}
          {song.ytViews != null && (
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-body-sm)',
                color: 'rgba(255,255,255,0.5)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              ▶ {formatViews(song.ytViews)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
