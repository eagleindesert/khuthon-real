# FE 컨텍스트

## 개요
YouTube URL을 입력하면 하단에서 영상을 재생하는 웹 프론트엔드.
YouTube IFrame Player API를 사용한 커스텀 컨트롤 바(재생/정지, 탐색바, 볼륨)를 제공한다.

## 스택
- React 18 + TypeScript + Vite
- 외부 라이브러리: `@types/youtube` (dev)
- 별도 UI 라이브러리 없음

## 실행
```bash
cd FE
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/ 생성
```

---

## 파일 구조

```
FE/
├── src/
│   ├── App.tsx                        # 루트: URL 입력 + YouTubePlayer 렌더
│   ├── App.css                        # 다크 테마, 입력창/버튼 스타일
│   ├── index.css                      # body/root 기본 리셋
│   ├── main.tsx                       # React 진입점 (StrictMode 포함)
│   ├── components/
│   │   ├── YouTubePlayer.tsx          # IFrame API 플레이어 + 커스텀 컨트롤
│   │   └── YouTubePlayer.css          # 플레이어/컨트롤 바 스타일
│   └── utils/
│       ├── youtube.ts                 # YouTube URL → videoId 파싱
│       └── youtubeApi.ts              # IFrame API 스크립트 단일 로드 유틸
```

---

## 핵심 모듈 설명

### `src/utils/youtube.ts`
`extractVideoId(url)` — 아래 형식에서 videoId를 추출해 반환. 실패 시 `null`.
- `youtube.com/watch?v=ID`
- `youtu.be/ID`
- `youtube.com/shorts/ID`
- `youtube.com/embed/ID`

### `src/utils/youtubeApi.ts`
`loadYouTubeApi()` — `window.YT` 스크립트를 **딱 한 번만** 로드하는 모듈 레벨 promise 캐시.
이미 로드됐거나 진행 중이면 동일 promise를 반환한다.

### `src/components/YouTubePlayer.tsx`
Props: `{ videoId: string }`

**초기화 방식 — StrictMode 이중 실행 대응이 핵심:**
- `containerRef`(React div)에 `playerDiv`를 **명령형으로** `appendChild`해서 React 재조정과 분리한다.
- `destroyed` 플래그로 cleanup 이후 비동기 `.then()` 실행을 차단한다.
- 이 패턴을 바꾸면 StrictMode 개발 환경에서 플레이어가 이중 생성돼 동작하지 않는다.

```
useEffect([], []) 
  └─ loadYouTubeApi().then()
       └─ destroyed 체크 → new YT.Player(playerDiv, { controls: 0, ... })
            ├─ onReady: isReadyRef = true, duration/volume 초기화
            └─ onStateChange: isPlaying/duration 상태 갱신, 500ms interval로 currentTime 추적
```

**영상 교체:** videoId prop 변경 시 `isReadyRef.current` 확인 후 `player.loadVideoById(videoId)` 호출.

**컨트롤:**
- 재생/정지: `playVideo()` / `pauseVideo()`
- 탐색바: `seekTo(time, true)` + `linear-gradient` inline style로 진행률 표시
- 볼륨: `setVolume(vol)`

### `src/App.tsx`
- `inputUrl` state → `extractVideoId()` → `videoId` state
- `videoId`가 있을 때만 `<YouTubePlayer videoId={videoId} />` 렌더
- Enter 키 / 재생 버튼 모두 지원

---

## 주요 설계 결정 및 주의사항

### StrictMode 이중 실행 문제 (해결됨)
React 18 StrictMode는 개발 모드에서 effect를 2회 실행한다.
`new YT.Player(id, ...)` 는 대상 div를 iframe으로 교체하는데, 첫 번째 실행이 교체한 뒤
두 번째 실행이 같은 ID로 접근하면 플레이어가 깨진다.
→ `playerDiv`를 명령형 생성 + `destroyed` 플래그로 해결. 이 구조를 반드시 유지할 것.

### playerVars
```ts
{ controls: 0, rel: 0, modestbranding: 1, iv_load_policy: 3 }
```
`controls: 0` 으로 YouTube 기본 컨트롤을 숨기고 커스텀 컨트롤만 노출한다.

### 탐색바 진행률
별도 레이어 대신 `input[type=range]`에 `linear-gradient` inline style을 직접 적용.
복잡한 z-index/pointer-events 구조를 피하기 위한 선택이다.
