import { apiClient } from './client'
import type { Song } from '@/types'

export type ReactionType = 'like' | 'dislike'

export const getRecommendations = () =>
  apiClient.get<Song[]>('/recommendations')

export const postReaction = (songId: number, type: ReactionType) =>
  apiClient.post(`/songs/${songId}/reactions`, { type })
