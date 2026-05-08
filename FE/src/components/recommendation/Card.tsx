import { useEffect, useRef, useState } from 'react'
import type { Song } from '@/types'
import { loadYouTubeApi } from '@/utils/youtubeApi'

interface Props {
  song: Song
  active: boolean
}

export default function Card({ song, active }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YT.Player | null>(null)
  const [isMuted, setIsMuted] = useState(true)

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
          mute: 1,
          controls: 0,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (e) => {
            if (!destroyed) e.target.playVideo()
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

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '3/4',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        background: 'var(--color-surface-container)',
        flexShrink: 0,
      }}
    >
      {/* Album art */}
      {song.albumArtUrl && (
        <img
          src={song.albumArtUrl}
          alt={`${song.title} 앨범 아트`}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}

      {/* Gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)' }} />

      {/* Hidden YouTube player container */}
      {song.youtubeVideoId && active && (
        <div
          ref={containerRef}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 1,
            height: 1,
            overflow: 'hidden',
            opacity: 0,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Mute toggle */}
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
          }}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      )}

      {/* Song info */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 'var(--space-lg)',
        }}
      >
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-headline-md)', fontWeight: 'var(--weight-bold)', color: '#fff', marginBottom: 'var(--space-xs)' }}>
          {song.title}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-sm)', color: 'rgba(255,255,255,0.7)', marginBottom: 'var(--space-sm)' }}>
          {song.artist}
        </p>
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
      </div>
    </div>
  )
}
