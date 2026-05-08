export interface User {
  id: number
  username: string
  nickname: string
  tags: string[]
  avatarUrl?: string
  createdAt: string
}

export interface Song {
  id: number
  title: string
  artist: string
  albumArtUrl?: string
  youtubeVideoId?: string
  genres: string[]
  durationSeconds?: number
  likeCount?: number
  dislikeCount?: number
}

export interface Comment {
  id: number
  songId: number
  author: User
  body: string
  createdAt: string
  updatedAt: string
  isEditing?: boolean
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PagedResponse<T> {
  items: T[]
  nextCursor?: string
  hasNext: boolean
}
