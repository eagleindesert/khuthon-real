# REST API 명세서

이 문서는 현재 REST API 엔드포인트에 대한 명세를 제공합니다.

## 기본 URL
`http://localhost:8080`

---

## 1. 인증 (Auth)

### 회원가입
새로운 사용자 계정을 생성합니다.

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **인증 필요**: NO
- **Request Body**:
  ```json
  {
    "loginId": "string",
    "password": "string",
    "nickname": "string",
    "preferredGenre": "string"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "userId": 1,
    "loginId": "string",
    "nickname": "string",
    "preferredGenre": "string"
  }
  ```
- **에러**:
  - `400 Bad Request`: `loginId`가 이미 존재하는 경우.

### 로그인
사용자를 인증하고 Redis에 세션을 생성합니다.

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **인증 필요**: NO
- **Request Body**:
  ```json
  {
    "loginId": "string",
    "password": "string"
  }
  ```
- **Response**: `200 OK`
  - **Headers**: `Set-Cookie: JSESSIONID=...`
  - **Body**:
    ```json
    {
      "userId": 1,
      "loginId": "string",
      "nickname": "string",
      "preferredGenre": "string"
    }
    ```
- **에러**:
  - `400 Bad Request`: `loginId` 또는 `password`가 일치하지 않는 경우.

### 로그아웃
현재 세션을 무효화하고 Redis에서 제거합니다.

- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **인증 필요**: YES (JSESSIONID 쿠키)
- **Response**: `200 OK`
  ```json
  {
    "message": "로그아웃 되었습니다."
  }
  ```
- **에러**:
  - `401 Unauthorized`: 로그인하지 않은 경우.

### 내 정보 조회
현재 로그인된 사용자의 정보를 조회합니다.

- **URL**: `/api/auth/me`
- **Method**: `GET`
- **인증 필요**: YES (JSESSIONID 쿠키)
- **Response**: `200 OK`
  ```json
  {
    "userId": 1,
    "loginId": "string",
    "nickname": "string",
    "preferredGenre": "string"
  }
  ```
- **에러**:
  - `401 Unauthorized`: 로그인하지 않았거나 세션이 만료된 경우.

---

## 3. 곡 목록 조회 (Songs)

### 장르별 곡 목록 조회
장르 이름으로 필터링된 곡 목록을 반환합니다. 장르를 지정하지 않으면 전체 목록을 반환합니다.

- **URL**: `/api/list`
- **Method**: `GET`
- **인증 필요**: NO
- **Query Parameters**:
  | 파라미터 | 타입 | 필수 | 설명 |
  | :--- | :--- | :--- | :--- |
  | `genre` | `String` | NO | 필터링할 장르 이름 (예: `Korean Indie`) |
- **Response**: `200 OK`
  ```json
  [
    {
      "songId": 1,
      "title": "string",
      "artist": "string",
      "genre": "string"
    },
    ...
  ]
  ```
  - `genre` 파라미터가 없으면 전체 곡 목록 반환
  - 해당 장르의 곡이 없으면 빈 배열 `[]` 반환

---


## 2. 음악 데이터 (갱신)

### 트랙 갱신
Spotify API에서 최신 트랙을 가져와 PostgreSQL에 저장하고 결과를 반환합니다.

- **URL**: `/api/refresh`
- **Method**: `POST`
- **인증 필요**: NO
- **Response**: `200 OK`
  ```json
  [
    {
      "artist": "string",
      "title": "string",
      "genre": "string"
    },
    ...
  ]
  ```

---

## 데이터 모델

### UserResponse
| 필드명 | 타입 | 설명 |
| :--- | :--- | :--- |
| `userId` | `Long` | 사용자의 고유 식별자 |
| `loginId` | `String` | 사용자의 로그인 ID |
| `nickname` | `String` | 사용자의 표시 닉네임 |
| `preferredGenre` | `String` | 사용자가 선호하는 음악 장르 |

### TrackInfo
| 필드명 | 타입 | 설명 |
| :--- | :--- | :--- |
| `artist` | `String` | 아티스트 이름 |
| `title` | `String` | 트랙 제목 |
| `genre` | `String` | 음악 장르 |
