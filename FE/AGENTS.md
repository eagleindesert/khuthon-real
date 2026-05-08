# FE — Agent Context

## 프로젝트 개요
마이너 씬 명곡 발굴 앱 (Track 1: 팬덤 검증 픽).
React 19 + Vite + TypeScript SPA. 백엔드: Spring Boot (`localhost:8080`).
모바일 우선, PhoneShell로 max-width 430px 고정 컨테이너.

## 기술 스택
- React 19.2.5 + TypeScript 6 (`erasableSyntaxOnly`, `noUnusedLocals`)
- React Router v7 (v6 API 동일)
- framer-motion v12 — `import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'`
- axios — `/api/*` prefix, Vite proxy → `localhost:8080`
- MSW v2 — DEV 환경에서만 활성화 (`import.meta.env.DEV`)
- yt-search — Vite dev server 미들웨어에서만 사용 (Node.js 전용)
- Docker: `FE/Dockerfile.dev` (Node 20 alpine), `FE/docker-compose.yml`

## TypeScript 제약
- `erasableSyntaxOnly: true` → `enum` 금지
- `noUnusedLocals/Parameters: true` → 미사용 import 즉시 제거
- `verbatimModuleSyntax: true` → type import는 `import type` 필수
- `allowUmdGlobalAccess: true` → YouTube IFrame API `YT` 전역 객체 사용 가능

## 디렉터리 구조
```
FE/
  yt-search.d.ts         # yt-search npm 패키지 타입 선언 (번들 타입 없음)
  vite.config.ts         # ytSearchPlugin: /yt-search 미들웨어 포함
  src/
    api/            client.ts (axios+interceptors), auth.ts, songs.ts, comments.ts, index.ts
    components/
      common/       Toast, BottomSheet, ActionSheet, ConfirmDialog, Skeleton
      auth/         LoginPage, SignUpWizard (Step1IdPw, Step2Nickname, Step3Tags)
      recommendation/ RecommendationPage, CardStack, Card, ActionButtons, CompletionScreen
      comment/      CommentModal, CommentList, CommentItem, CommentInput, InlineEditor
      layout/       AuthGuard, MainLayout, PhoneShell
    contexts/       AuthContext, ToastContext
    hooks/          useToast
    mocks/          handlers.ts (MSW), browser.ts
    routes/         index.tsx
    types/          index.ts (User, Song, Comment, PagedResponse)
    utils/          sceneTags.ts, youtubeApi.ts, resolveYouTubeId.ts
    App.tsx         BrowserRouter > AuthProvider > PhoneShell > ToastProvider > AppRoutes
    main.tsx        MSW enableMocking().then(render)
```

## PhoneShell 레이아웃 패턴
- `position: relative; overflow: hidden; max-width: 430px; height: 100dvh` 컨테이너
- BottomSheet, ActionSheet, ConfirmDialog, ToastContainer 모두 `position: absolute` (fixed 아님)
- 이유: `position: fixed`는 viewport 기준이라 PhoneShell과 정렬 불일치 발생
- `src/index.css`에 body max-width 없음 — PhoneShell이 직접 너비 제한

## 애니메이션 시스템 (framer-motion)
### Card 스와이프
```tsx
const x = useMotionValue(0)
const rotate = useTransform(x, [-200, 200], [-18, 18])
const likeOpacity = useTransform(x, [20, 100], [0, 1])     // 오른쪽 드래그 → LIKE 배지
const dislikeOpacity = useTransform(x, [-100, -20], [1, 0]) // 왼쪽 드래그 → NOPE 배지
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
- `yt-search.d.ts`에 `VideoResult { videoId, title, seconds, views }` 선언

### 2. 브라우저 유틸 — resolveYouTubeId.ts
```ts
export interface YouTubeInfo { videoId: string|null; views: number|null }
// 인메모리 캐시(Map) → 세션 내 중복 조회 방지
export async function resolveYouTubeId(title, artist): Promise<YouTubeInfo>
```
- `RecommendationPage`에서 곡 로드 직후 백그라운드 forEach로 각 곡 resolve
- 결과로 `setSongs(prev => prev.map(s => s.id===song.id ? {...s, youtubeVideoId, ytViews} : s))`

### 3. IFrame 플레이어 — Card.tsx
- `loadYouTubeApi()` (싱글턴, `src/utils/youtubeApi.ts`) → `new YT.Player(playerDiv, {...})`
- StrictMode 대응: `destroyed` 플래그 + `playerDiv` 명령형 생성/제거
- `onReady` 콜백에서 `e.target.getIframe()`으로 iframe 요소 직접 스타일 적용:
  ```ts
  iframe.style.width = `${(16/9)/(3/4)*100}%`  // ≈237%, 16:9 → 3:4 cover 크롭
  iframe.style.position = 'absolute'
  iframe.style.left = '50%'
  iframe.style.transform = 'translateX(-50%)'
  ```
- DOM 레이어 순서: 앨범아트 → YouTube 컨테이너 → 그라디언트 → LIKE/NOPE 배지 → 뮤트 버튼 → 곡 정보

### 4. 조회수 표시
- `Song.ytViews?: number` 필드 (클라이언트 enrichment, BE 미제공)
- `formatViews(n)`: `<1K → 숫자`, `1K~10K → 1.2K`, `≥10K → 12K`, `≥1M → 1.2M`
- 카드 하단 장르 태그 행 우측에 `▶ 2.2K` 형식으로 표시

## 실제 BE API 명세 (`BE/docs/api_spec.md` 기준)
```
POST /api/auth/register   { loginId, password, nickname, preferredGenre } → UserResponse (201)
POST /api/auth/login      { loginId, password } → UserResponse + Set-Cookie: JSESSIONID
POST /api/auth/logout     → { message } (인증: JSESSIONID 쿠키)
GET  /api/auth/me         → UserResponse (인증: JSESSIONID 쿠키)
POST /api/refresh         → [{ artist, title, genre }]  ← Spotify에서 트랙 갱신
```
**주의**: 인증은 JWT Bearer 토큰이 아닌 **세션 쿠키(JSESSIONID)** 기반.  
현재 FE의 `api/client.ts`는 JWT 인터셉터로 구현되어 있어 BE 연결 시 수정 필요.  
`/api/recommendations`, `/api/songs/:id/reactions`, `/api/songs/:id/comments`는 아직 BE 미구현 → MSW 목이 대신 처리.

## MSW 목 데이터 (`src/mocks/handlers.ts`)
- 목 곡 3개: `youtubeVideoId` 제거됨 (실제 BE 동작 시뮬레이션 — yt-search가 resolve)
- 인증: `/api/auth/login` → `{ accessToken: 'mock-token-xyz', user: mockUser }`
- 댓글 CRUD 완전 구현 (nextCommentId 자동 증가)

## 핵심 패턴
- **AuthGuard**: `isLoading` 중 `null` → 하이드레이션 깜박임 방지
- **401 interceptor**: `window.location.href = '/login'`
- **댓글 낙관적 UI**: `temp-${Date.now()} as unknown as number` 즉시 추가 → 성공 시 교체
- **댓글 삭제 undo**: 즉시 UI 제거 → 5초 타이머 → "되돌리기" 클릭 시 타이머 취소
- **ToastContext**: `useMemo`로 `toast` 객체 안정화 (stale closure 방지)

## 씬 태그
`src/utils/sceneTags.ts`에 20개 하드코딩. `type SceneTag = typeof SCENE_TAGS[number]`
