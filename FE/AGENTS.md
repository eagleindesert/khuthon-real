# FE — Agent Context

## 프로젝트 개요
마이너 씬 명곡 발굴 앱 (Track 1: 팬덤 검증 픽).
React 19 + Vite + TypeScript SPA. 백엔드: Spring Boot (`140.245.71.20:8080`).
모바일 우선, PhoneShell로 max-width 430px 고정 컨테이너.

## 기술 스택
- React 19.2.5 + TypeScript 6 (`erasableSyntaxOnly`, `noUnusedLocals`)
- React Router v7 (v6 API 동일)
- framer-motion v12 — `import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'`
- axios — `/api/*` prefix, Vite proxy → `VITE_PROXY_TARGET` (.env), `withCredentials: true`
- MSW **제거됨** — 모든 요청 실제 BE로 전달
- yt-search — Vite dev server 미들웨어에서만 사용 (Node.js 전용)
- Docker: `FE/Dockerfile.dev` (Node 20 alpine), `FE/docker-compose.yml` (`env_file: .env`)

## TypeScript 제약
- `erasableSyntaxOnly: true` → `enum` 금지
- `noUnusedLocals/Parameters: true` → 미사용 import 즉시 제거
- `verbatimModuleSyntax: true` → type import는 `import type` 필수
- `allowUmdGlobalAccess: true` → YouTube IFrame API `YT` 전역 객체 사용 가능

## 디렉터리 구조
```
FE/
  .env                   # VITE_PROXY_TARGET=http://<BE_IP>:8080 (gitignore됨)
  yt-search.d.ts         # yt-search npm 패키지 타입 선언
  vite.config.ts         # readDotEnv(__dirname)로 .env 직접 읽음, ytSearchPlugin 포함
  src/
    api/            client.ts, auth.ts, songs.ts, comments.ts, index.ts
    components/
      common/       Toast, BottomSheet, ActionSheet, ConfirmDialog, Skeleton
      auth/         LoginPage, SignUpWizard (Step1IdPw, Step2Nickname, Step3Genre)
      recommendation/ RecommendationPage, CardStack, Card, ActionButtons, CompletionScreen
      comment/      CommentModal, CommentList, CommentItem, CommentInput, InlineEditor
      mypage/       MyPage
      layout/       AuthGuard, MainLayout (하단 탭 내비게이션), PhoneShell
    contexts/       AuthContext, ToastContext
    hooks/          useToast
    routes/         index.tsx  (/discover, /me)
    types/          index.ts (User, Song, Comment, PagedResponse)
    utils/          sceneTags.ts, youtubeApi.ts, resolveYouTubeId.ts
    App.tsx         BrowserRouter > AuthProvider > PhoneShell > ToastProvider > AppRoutes
    main.tsx        직접 render (MSW 없음)
```

## Vite 프록시 설정
```ts
// vite.config.ts — loadEnv 대신 fs로 직접 읽음 (cwd 의존성 제거)
function readDotEnv(dir: string): Record<string, string>
const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:8080'
```
- `.env`는 gitignore 처리됨 — 로컬에서 수동 생성 필요
- Docker: `docker-compose.yml`의 `env_file: .env`로 컨테이너에 주입

## PhoneShell 레이아웃 패턴
- `position: relative; overflow: hidden; max-width: 430px; height: 100dvh` 컨테이너
- BottomSheet, ActionSheet, ConfirmDialog, ToastContainer 모두 `position: absolute` (fixed 아님)
- `src/index.css`에 body max-width 없음 — PhoneShell이 직접 너비 제한

## 애니메이션 시스템 (framer-motion)
### Card 스와이프
```tsx
const x = useMotionValue(0)
const rotate = useTransform(x, [-200, 200], [-18, 18])
const likeOpacity = useTransform(x, [20, 100], [0, 1])
const dislikeOpacity = useTransform(x, [-100, -20], [1, 0])
// drag="x", dragConstraints={{ left:0, right:0 }}, dragElastic={0.9}
// onDragEnd: |offset| > 80px 또는 |velocity| > 500 → animate(x, ±600) → onSwipe()
```
### CardStack 진입 애니메이션
```tsx
<motion.div key={current.id} initial={{ opacity:0, scale:0.92, y:16 }} animate={{ opacity:1, scale:1, y:0 }}>
```
### ActionButtons
```tsx
<motion.button whileTap={{ scale: 0.82 }} transition={{ type:'spring', stiffness:500, damping:18 }}>
```

## YouTube 통합

### 1. ID 조회 — yt-search Vite 미들웨어
- `vite.config.ts` `ytSearchPlugin()` → `GET /yt-search?title=...&artist=...`
- Node.js에서 `yt-search` 실행 → 6분(360초) 이하 영상 중 첫 번째 반환
- 응답: `{ videoId: string|null, views: number|null }`

### 2. 브라우저 유틸 — resolveYouTubeId.ts
```ts
export interface YouTubeInfo { videoId: string|null; views: number|null }
// 인메모리 캐시(Map) → 세션 내 중복 조회 방지
export async function resolveYouTubeId(title, artist): Promise<YouTubeInfo>
```

### 3. IFrame 플레이어 — Card.tsx
- `loadYouTubeApi()` (싱글턴) → `new YT.Player(playerDiv, {...})`
- StrictMode 대응: `destroyed` 플래그 + `playerDiv` 명령형 생성/제거
- iframe cover 크롭: `width ≈ 237%`, `left:50%; transform:translateX(-50%)`
- DOM 레이어 순서: 앨범아트 → YouTube 컨테이너 → 그라디언트 → LIKE/NOPE 배지 → 뮤트 버튼 → 곡 정보

### 4. 조회수 표시
- `Song.ytViews?: number` (클라이언트 enrichment)
- `formatViews(n)`: `<1K → 숫자`, `1K~10K → 1.2K`, `≥10K → 12K`, `≥1M → 1.2M`
- 카드 하단 장르 태그 행 우측에 `▶ 2.2K` 형식으로 표시

## 인증 구조

### 방식: 세션 쿠키 (`SESSION` 쿠키 — Spring Session Redis)
- `api/client.ts`: `withCredentials: true`, JWT 인터셉터 없음
- 401 인터셉터: `/login`, `/signup`에서는 리다이렉트 건너뜀 (무한루프 방지)
- 앱 마운트 → `getMe()` → 쿠키 있으면 로그인 유지, 없으면 `currentUser = null`

### User 타입 (BE UserResponse 일치)
```ts
interface User {
  userId: number
  loginId: string
  nickname: string
  preferredGenre: string
  tags?: string[]  // optional, 미사용 (목 데이터 잔재)
}
```

### SignUpWizard: 3단계
1. 아이디(`loginId`) + 비밀번호
2. 닉네임
3. 커뮤니티 **단일 선택**: `힙합커뮤 | 밴드커뮤 | 일반인` (BE DB 컬럼값과 일치)

## BE API 명세 (구현 완료)

### 인증
```
POST /api/auth/register   { loginId, password, nickname, preferredGenre } → UserResponse (201)
POST /api/auth/login      { loginId, password } → UserResponse + Set-Cookie: SESSION (200)
POST /api/auth/logout     → { message }
GET  /api/auth/me         → UserResponse
```

### 음악 데이터
```
POST /api/refresh  → TrackInfo[]  [{ artist, title, genre }]
                     Spotify 4개 장르 쿼리로 DB 갱신 후 반환
POST /api/like     { songId: number, preferredGenre: string, like: number }
                   → { message: "좋아요가 반영되었습니다." }
                   커뮤니티별 좋아요 카운트 (hiphop/band/general_like_count)
```

### FE 추천 흐름
- `POST /api/refresh` → `TrackInfo[]` → `Song[]` 매핑 (`id = index`, `genres = [genre]`)
- 곡 로드 후 백그라운드에서 `resolveYouTubeId()` → YouTube 영상 자동 연결
- `/api/recommendations`, `/api/songs/:id/reactions`, `/api/songs/:id/comments` — **BE 미구현**

## BE DB 스키마 (준비됨, API 미노출)
```sql
song_stats(song_id, app_view_count, app_like_count,
           hiphop_like_count, band_like_count, general_like_count)
song_reaction(reaction_id, user_id, song_id, reaction_type)
user_genre_preference(user_id, genre_id, preference_percent)
```

## 라우트 구조
```
/login    → LoginPage (public)
/signup   → SignUpWizard (public)
/discover → RecommendationPage (AuthGuard)
/me       → MyPage (AuthGuard) — 닉네임/아이디/커뮤니티 표시 + 로그아웃
```
- MainLayout: 하단 탭 내비게이션 (🎵 발견 / 👤 내 정보)

## 핵심 패턴
- **AuthGuard**: `isLoading` 중 `null` → 하이드레이션 깜박임 방지
- **401 interceptor**: `/login`, `/signup` 이외 경로에서만 리다이렉트
- **댓글 낙관적 UI**: `temp-${Date.now()} as unknown as number` 즉시 추가 → 성공 시 교체
- **댓글 삭제 undo**: 즉시 UI 제거 → 5초 타이머 → "되돌리기" 클릭 시 타이머 취소
- **ToastContext**: `useMemo`로 `toast` 객체 안정화 (stale closure 방지)
