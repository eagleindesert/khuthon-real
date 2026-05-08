import { http, HttpResponse } from 'msw'
import type { User, Song, Comment } from '@/types'

const mockUser: User = {
  id: 1,
  username: 'testuser',
  nickname: '음악탐험가',
  tags: ['인디록', '재즈'],
  createdAt: new Date().toISOString(),
}

const mockSongs: Song[] = [
  {
    id: 1,
    title: 'Hummingbird',
    artist: 'Local Natives',
    albumArtUrl: 'https://picsum.photos/seed/song1/400/400',
    youtubeVideoId: 'dQw4w9WgXcQ',
    genres: ['인디록', '얼터너티브'],
  },
  {
    id: 2,
    title: 'Holocene',
    artist: 'Bon Iver',
    albumArtUrl: 'https://picsum.photos/seed/song2/400/400',
    youtubeVideoId: 'dQw4w9WgXcQ',
    genres: ['인디팝', '포크'],
  },
  {
    id: 3,
    title: 'Motion Picture Soundtrack',
    artist: 'Radiohead',
    albumArtUrl: 'https://picsum.photos/seed/song3/400/400',
    youtubeVideoId: 'dQw4w9WgXcQ',
    genres: ['얼터너티브', '포스트록'],
  },
]

const mockComments: Comment[] = [
  {
    id: 1,
    songId: 1,
    author: { ...mockUser, id: 2, nickname: '재즈마니아', tags: ['재즈', '블루스'] },
    body: '이 곡 정말 숨겨진 명곡이에요. 처음 들었을 때 소름이 돋았습니다.',
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
    updatedAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: 2,
    songId: 1,
    author: mockUser,
    body: '인트로 부분이 진짜 예술이에요.',
    createdAt: new Date(Date.now() - 1800_000).toISOString(),
    updatedAt: new Date(Date.now() - 1800_000).toISOString(),
  },
]

let nextCommentId = 100

export const handlers = [
  http.post('/api/auth/login', () => {
    return HttpResponse.json({ accessToken: 'mock-token-xyz', user: mockUser })
  }),

  http.post('/api/auth/signup', () => {
    return HttpResponse.json({ user: mockUser })
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json(mockUser)
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({})
  }),

  http.get('/api/recommendations', () => {
    return HttpResponse.json(mockSongs)
  }),

  http.post('/api/songs/:id/reactions', () => {
    return HttpResponse.json({ ok: true })
  }),

  http.get('/api/songs/:id/comments', ({ params }) => {
    const songId = Number(params.id)
    const items = mockComments.filter((c) => c.songId === songId)
    return HttpResponse.json({ items, hasNext: false })
  }),

  http.post('/api/songs/:id/comments', async ({ params, request }) => {
    const songId = Number(params.id)
    const body = await request.json() as { text: string }
    const newComment: Comment = {
      id: nextCommentId++,
      songId,
      author: mockUser,
      body: body.text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockComments.push(newComment)
    return HttpResponse.json(newComment, { status: 201 })
  }),

  http.put('/api/comments/:id', async ({ params, request }) => {
    const id = Number(params.id)
    const body = await request.json() as { text: string }
    const comment = mockComments.find((c) => c.id === id)
    if (!comment) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    comment.body = body.text
    comment.updatedAt = new Date().toISOString()
    return HttpResponse.json(comment)
  }),

  http.delete('/api/comments/:id', ({ params }) => {
    const id = Number(params.id)
    const idx = mockComments.findIndex((c) => c.id === id)
    if (idx !== -1) mockComments.splice(idx, 1)
    return HttpResponse.json({}, { status: 204 })
  }),
]
