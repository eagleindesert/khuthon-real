export interface YouTubeInfo {
  videoId: string | null
  views: number | null
}

const cache = new Map<string, YouTubeInfo>()

export async function resolveYouTubeId(title: string, artist: string): Promise<YouTubeInfo> {
  const key = `${title}:${artist}`
  if (cache.has(key)) return cache.get(key)!
  try {
    const params = new URLSearchParams({ title, artist })
    const res = await fetch(`/yt-search?${params}`)
    const info: YouTubeInfo = res.ok
      ? await res.json() as YouTubeInfo
      : { videoId: null, views: null }
    cache.set(key, info)
    return info
  } catch {
    const info: YouTubeInfo = { videoId: null, views: null }
    cache.set(key, info)
    return info
  }
}
