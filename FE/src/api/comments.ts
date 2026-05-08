import { apiClient } from './client'
import type { Comment, PagedResponse } from '@/types'

export const getComments = (songId: number, cursor?: string) =>
  apiClient.get<PagedResponse<Comment>>(`/songs/${songId}/comments`, {
    params: cursor ? { cursor } : undefined,
  })

export const postComment = (songId: number, text: string) =>
  apiClient.post<Comment>(`/songs/${songId}/comments`, { text })

export const putComment = (commentId: number, text: string) =>
  apiClient.put<Comment>(`/comments/${commentId}`, { text })

export const deleteComment = (commentId: number) =>
  apiClient.delete(`/comments/${commentId}`)
