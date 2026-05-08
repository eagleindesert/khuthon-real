import { useState, KeyboardEvent } from 'react'
import { extractVideoId } from './utils/youtube'
import YouTubePlayer from './components/YouTubePlayer'
import './App.css'

function App() {
  const [inputUrl, setInputUrl] = useState('')
  const [videoId, setVideoId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handlePlay = () => {
    const id = extractVideoId(inputUrl)
    if (id) {
      setVideoId(id)
      setError('')
    } else {
      setVideoId(null)
      setError('유효한 YouTube URL을 입력해주세요.')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handlePlay()
  }

  return (
    <div className="container">
      <h1><span>YouTube</span> 플레이어</h1>

      <div className="input-row">
        <input
          type="text"
          placeholder="YouTube URL을 입력하세요 (예: https://www.youtube.com/watch?v=...)"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handlePlay}>재생</button>
      </div>

      {error && <p className="error">{error}</p>}

      {videoId && <YouTubePlayer videoId={videoId} />}
    </div>
  )
}

export default App
