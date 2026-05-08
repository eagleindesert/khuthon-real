import { apiClient } from './client'
import type { Comment } from '@/types'

export const getComments = (songId: number) =>
  apiClient.get<Comment[]>(`/songs/${songId}/comments`)

export const postComment = (songId: number, content: string) =>
  apiClient.post<Comment>(`/songs/${songId}/comments`, { content })

export const putComment = (commentId: number, content: string) =>
  apiClient.put<Comment>(`/comments/${commentId}`, { content })

export const deleteComment = (commentId: number) =>
  apiClient.delete(`/comments/${commentId}`)
