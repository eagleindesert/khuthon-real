# FE — Agent Context

## 프로젝트 개요
마이너 씬 명곡 발굴 앱 (Track 1: 팬덤 검증 픽).
React 19 + Vite + TypeScript SPA. 백엔드: Spring Boot 4.0.6 (`localhost:8080`).
모바일 우선 (360px 기준), max-width 430px.

## 기술 스택
- React 19.2.5 + TypeScript 6 (erasableSyntaxOnly, noUnusedLocals)
- React Router v7 (v6 API 동일)
- framer-motion v12 — `import { motion, AnimatePresence } from 'framer-motion'`
- axios — `/api/*` prefix, Vite proxy → `localhost:8080`
- MSW v2 — DEV 환경에서만 활성화 (`import.meta.env.DEV`)
- Docker: `Dockerfile.dev` (Node 20 alpine), 루트 `docker-compose.yml`

## TypeScript 제약
- `erasableSyntaxOnly: true` → `enum` 금지, `const` 객체 or `type` 사용
- `noUnusedLocals/Parameters: true` → 미사용 import 즉시 제거
- `verbatimModuleSyntax: true` → type import는 `import type` 필수

## 디렉터리 구조
```
src/
  api/            client.ts (axios+interceptors), auth.ts, songs.ts, comments.ts, index.ts
  components/
    common/       Toast, BottomSheet, ActionSheet, ConfirmDialog, Skeleton
    auth/         LoginPage, SignUpWizard (Step1IdPw, Step2Nickname, Step3Tags)
    recommendation/ RecommendationPage, CardStack, Card, ActionButtons, CompletionScreen
    comment/      CommentModal, CommentList, CommentItem, CommentInput, InlineEditor
    layout/       AuthGuard, MainLayout
  contexts/       AuthContext, ToastContext
  hooks/          useToast
  mocks/          handlers.ts (MSW), browser.ts
  routes/         index.tsx
  types/          index.ts (User, Song, Comment, PagedResponse)
  utils/          sceneTags.ts, youtubeApi.ts
  App.tsx         BrowserRouter > AuthProvider > ToastProvider > AppRoutes
  main.tsx        MSW enableMocking().then(render)
```

## CSS 변수 (src/index.css)
- `--color-surface: #121414` (앱 배경)
- `--color-surface-container: #1e2020` (카드/모달 배경)
- `--color-surface-container-high: #282a2b` (hover/input)
- `--color-primary: #53e076` (CTA, 좋아요 active)
- `--color-on-surface: #e2e2e2` (기본 텍스트)
- `--color-on-surface-variant: #bccbb9` (보조 텍스트, 뱃지)
- `--color-outline: #869585` (border, divider)
- `--color-error: #ffb4ab` (에러 토스트, 삭제)
- `--font-display: 'Montserrat'` / `--font-body: 'Plus Jakarta Sans'`
- `--space-gutter: 24px` / `--radius-full: 9999px` (버튼 pill)

## 핵심 패턴
- **AuthGuard**: `isLoading` 중 `null` → JWT hydration 깜박임 방지
- **401 interceptor**: `window.location.href = '/login'` (컴포넌트 트리 밖)
- **CardStack**: CommentModal이 열려도 unmount 안 됨 → YouTube iframe 음악 유지
- **댓글 낙관적 UI**: temp id `temp-${Date.now()}` 즉시 추가, 성공 시 교체, 실패 시 롤백+토스트
- **댓글 삭제 undo**: 즉시 UI 제거 → 5초 타이머 → "되돌리기" 클릭 시 타이머 취소

## API 계약
```
POST /api/auth/login         { username, password } → { accessToken, user }
POST /api/auth/signup        { username, password, nickname, tags[] }
GET  /api/auth/me            → User
GET  /api/recommendations    → Song[]
POST /api/songs/:id/reactions { type: 'like'|'dislike' }
GET  /api/songs/:id/comments  → { items: Comment[], hasNext }
POST /api/songs/:id/comments  { text } → Comment
PUT  /api/comments/:id        { text } → Comment
DELETE /api/comments/:id
```

## 구현 상태
- [x] Step 1: 프로젝트 셋업 (Vite+TS, axios, AuthContext, MSW, Router, Docker)
- [x] Step 2: 공용 컴포넌트 (BottomSheet, ActionSheet, ConfirmDialog, Toast, Skeleton)
- [x] Step 3: 인증 플로우 (LoginPage, SignUpWizard 3단계)
- [x] Step 4: 추천 페이지 (CardStack, Card, YouTube embed)
- [x] Step 5: 댓글 모달 (낙관적 UI)
- [x] Step 6: 본인 댓글 관리 (InlineEditor, undo 토스트)
- [x] Step 7: 엣지 케이스 (스켈레톤, 빈 상태, 임시저장)

## 주의사항
- `Song.youtubeVideoId` optional — 백엔드와 필드명 미확정
- 씬 태그: `src/utils/sceneTags.ts`에 하드코딩 (20개)
- YouTube IFrame API: `src/utils/youtubeApi.ts` 싱글턴 로더
  - StrictMode 대응: `playerDiv` 명령형 생성 + `destroyed` 플래그
- Docker `VITE_PROXY_TARGET` 환경변수로 호스트/컨테이너 이중 대응
