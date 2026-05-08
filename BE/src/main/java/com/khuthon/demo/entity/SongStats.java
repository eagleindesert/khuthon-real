package com.khuthon.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "song_stats")
@Getter
@NoArgsConstructor
public class SongStats {

    @Id
    @Column(name = "song_id")
    private Long songId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "song_id")
    private Song song;

    @Column(name = "app_view_count", nullable = false)
    private Long appViewCount = 0L;

    @Column(name = "app_like_count", nullable = false)
    private Long appLikeCount = 0L;

    @Column(name = "hiphop_like_count", nullable = false)
    private Long hiphopLikeCount = 0L;   // 힙합커뮤 좋아요 수

    @Column(name = "band_like_count", nullable = false)
    private Long bandLikeCount = 0L;     // 밴드커뮤 좋아요 수

    @Column(name = "general_like_count", nullable = false)
    private Long generalLikeCount = 0L;  // 일반인 좋아요 수

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public SongStats(Song song) {
        this.song = song;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * preferred_genre(커뮤니티 그룹)에 따라 해당 그룹의 좋아요 수와 전체 좋아요 수를 증가시킵니다.
     */
    public void addLike(String preferredGenre, long count) {
        this.appLikeCount += count;
        switch (preferredGenre) {
            case "힙합커뮤" -> this.hiphopLikeCount += count;
            case "밴드커뮤" -> this.bandLikeCount += count;
            case "일반인"   -> this.generalLikeCount += count;
            default -> throw new IllegalArgumentException("알 수 없는 그룹: " + preferredGenre);
        }
        this.updatedAt = LocalDateTime.now();
    }
}
