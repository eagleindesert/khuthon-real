export interface User {
  userId: number
  loginId: string
  nickname: string
  preferredGenre: string
  tags?: string[]
}

export interface Song {
  id: number
  title: string
  artist: string
  albumArtUrl?: string
  youtubeVideoId?: string
  ytViews?: number
  genres: string[]
  durationSeconds?: number
  likeCount?: number
  dislikeCount?: number
}

export interface Comment {
  commentId: number
  nickname: string
  preferredGenre: string
  content: string
  createdAt: string
  pending?: boolean
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
