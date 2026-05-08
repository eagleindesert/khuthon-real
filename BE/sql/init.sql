-- ============================================================
-- khuthon DB 초기화 스크립트
-- 참조 무결성을 위해 의존 순서대로 테이블 생성
-- ============================================================

-- ------------------------------------------------------------
-- 1. GENRE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS genre (
    genre_id BIGSERIAL PRIMARY KEY,
    name     VARCHAR(100) NOT NULL UNIQUE
);

-- ------------------------------------------------------------
-- 2. SONG  (genre 참조)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS song (
    song_id          BIGSERIAL PRIMARY KEY,
    title            VARCHAR(255) NOT NULL,
    artist           VARCHAR(255) NOT NULL,
    genre_id         BIGINT       NOT NULL REFERENCES genre(genre_id),
    duration_seconds INT,
    youtube_video_id VARCHAR(50)  UNIQUE,
    youtube_url      VARCHAR(512),
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 3. SONG_STATS  (song 1:1 캐시, song_id가 PK이자 FK)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS song_stats (
    song_id                  BIGINT PRIMARY KEY REFERENCES song(song_id) ON DELETE CASCADE,
    app_view_count           BIGINT NOT NULL DEFAULT 0,
    app_like_count           BIGINT NOT NULL DEFAULT 0,
    preferred_genre_like_count BIGINT NOT NULL DEFAULT 0,
    updated_at               TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 4. USER
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "user" (
    user_id         BIGSERIAL PRIMARY KEY,
    login_id        VARCHAR(100) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    nickname        VARCHAR(100) NOT NULL,
    preferced_genre VARCHAR(100),          -- 스키마 원본 오타 유지
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 5. USER_GENRE_PREFERENCE  (user + genre 복합 PK)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_genre_preference (
    user_id            BIGINT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    genre_id           BIGINT NOT NULL REFERENCES genre(genre_id),
    preference_percent INT    NOT NULL DEFAULT 0
        CHECK (preference_percent BETWEEN 0 AND 100),
    PRIMARY KEY (user_id, genre_id)
);

-- ------------------------------------------------------------
-- 6. SONG_REACTION  (user + song 반응 기록)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS song_reaction (
    reaction_id   BIGSERIAL PRIMARY KEY,
    user_id       BIGINT       NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    song_id       BIGINT       NOT NULL REFERENCES song(song_id)   ON DELETE CASCADE,
    reaction_type VARCHAR(50)  NOT NULL,   -- ex) 'LIKE', 'SKIP', 'REPLAY'
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 인덱스 (선택적 성능 최적화)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_song_genre        ON song(genre_id);
CREATE INDEX IF NOT EXISTS idx_reaction_user     ON song_reaction(user_id);
CREATE INDEX IF NOT EXISTS idx_reaction_song     ON song_reaction(song_id);
CREATE INDEX IF NOT EXISTS idx_ugp_genre         ON user_genre_preference(genre_id);
