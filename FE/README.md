# YouTube 플레이어 프론트엔드

YouTube URL을 입력하면 하단에서 영상을 재생하는 웹 프론트엔드입니다.

**스택:** React + TypeScript + Vite

---

## 시작하기

### 1. 의존성 설치

```bash
cd FE
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 3. 프로덕션 빌드

```bash
npm run build
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.

### 4. 빌드 결과물 미리보기

```bash
npm run preview
```

---

## 사용법

1. 입력창에 YouTube URL을 붙여넣습니다.
2. **재생** 버튼을 클릭하거나 **Enter** 키를 누릅니다.
3. 하단에 영상이 임베드되어 자동 재생됩니다.

### 지원하는 URL 형식

| 형식 | 예시 |
|------|------|
| 일반 영상 | `https://www.youtube.com/watch?v=VIDEO_ID` |
| 단축 URL | `https://youtu.be/VIDEO_ID` |
| Shorts | `https://www.youtube.com/shorts/VIDEO_ID` |
| 임베드 | `https://www.youtube.com/embed/VIDEO_ID` |
