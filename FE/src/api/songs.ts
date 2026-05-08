import { apiClient } from './client'
import type { Song } from '@/types'

export type ReactionType = 'like' | 'dislike'

interface TrackInfo {
  artist: string
  title: string
  genre: string
}

export const refreshTracks = async (): Promise<Song[]> => {
  const res = await apiClient.post<TrackInfo[]>('/refresh')
  return res.data.map((t, i) => ({
    id: i,
    title: t.title,
    artist: t.artist,
    genres: [t.genre],
  }))
}

export const postReaction = (songId: number, type: ReactionType) =>
  apiClient.post(`/songs/${songId}/reactions`, { type })
