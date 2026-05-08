import { apiClient } from './client'
import type { Song } from '@/types'

export type ReactionType = 'like' | 'dislike'

export const GENRES = [
  'Korean Indie',
  'Underground Hiphop 한국',
  'Korean R&B',
  'Korean Rock',
] as const

export type Genre = typeof GENRES[number]

interface TrackInfo {
  songId: number
  title: string
  artist: string
  genre: string
}

export const getList = async (genre: Genre): Promise<Song[]> => {
  const res = await apiClient.get<TrackInfo[]>('/list', { params: { genre } })
  return res.data.map((t) => ({
    id: t.songId,
    title: t.title,
    artist: t.artist,
    genres: [t.genre],
  }))
}

export const postReaction = (songId: number, type: ReactionType) =>
  apiClient.post(`/songs/${songId}/reactions`, { type })
