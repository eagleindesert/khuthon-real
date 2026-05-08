import { useEffect, useRef, useState } from 'react'
import { loadYouTubeApi } from '../utils/youtubeApi'
import './YouTubePlayer.css'

interface Props {
  videoId: string
}

export default function YouTubePlayer({ videoId }: Props) {
  const playerRef = useRef<YT.Player | null>(null)
  const playerIdRef = useRef(`yt-${Math.random().toString(36).slice(2)}`)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isReadyRef = useRef(false)

  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    loadYouTubeApi().then(() => {
      playerRef.current = new YT.Player(playerIdRef.current, {
        videoId,
        playerVars: { controls: 0, rel: 0, modestbranding: 1, iv_load_policy: 3 },
        events: {
          onReady: (e) => {
            e.target.setVolume(80)
            setDuration(e.target.getDuration())
            isReadyRef.current = true
            setIsReady(true)
          },
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.PLAYING) {
              setDuration(e.target.getDuration())
              setIsPlaying(true)
              startTracking()
            } else if (e.data === YT.PlayerState.ENDED) {
              setIsPlaying(false)
              setCurrentTime(0)
              stopTracking()
            } else {
              setIsPlaying(false)
              stopTracking()
            }
          },
        },
      })
    })

    return () => {
      stopTracking()
      playerRef.current?.destroy()
      playerRef.current = null
      isReadyRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!isReadyRef.current || !playerRef.current) return
    playerRef.current.loadVideoById(videoId)
    setCurrentTime(0)
    setIsPlaying(false)
    stopTracking()
  }, [videoId])

  const startTracking = () => {
    stopTracking()
    intervalRef.current = setInterval(() => {
      if (playerRef.current) setCurrentTime(playerRef.current.getCurrentTime())
    }, 500)
  }

  const stopTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const togglePlay = () => {
    if (!playerRef.current) return
    isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo()
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value)
    setCurrentTime(time)
    playerRef.current?.seekTo(time, true)
  }

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value)
    setVolume(vol)
    playerRef.current?.setVolume(vol)
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="yt-wrapper">
      <div className="yt-video">
        <div id={playerIdRef.current} />
      </div>

      <div className="yt-controls">
        <button className="yt-play-btn" onClick={togglePlay} disabled={!isReady}>
          {isPlaying ? (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        <span className="yt-time">{formatTime(currentTime)}</span>

        <div className="yt-seek-wrapper">
          <div className="yt-seek-track">
            <div className="yt-seek-progress" style={{ width: `${progress}%` }} />
          </div>
          <input
            className="yt-seek"
            type="range"
            min={0}
            max={duration || 1}
            step={0.5}
            value={currentTime}
            onChange={handleSeek}
          />
        </div>

        <span className="yt-time">{formatTime(duration)}</span>

        <div className="yt-volume-group">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="yt-volume-icon">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
          <input
            className="yt-volume"
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={handleVolume}
          />
        </div>
      </div>
    </div>
  )
}
