package com.khuthon.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "song")
@Getter
@NoArgsConstructor
public class Song {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "song_id")
    private Long songId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "artist", nullable = false)
    private String artist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "genre_id", nullable = false)
    private Genre genre;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "youtube_video_id", unique = true, length = 50)
    private String youtubeVideoId;

    @Column(name = "youtube_url", length = 512)
    private String youtubeUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Song(String title, String artist, Genre genre) {
        this.title = title;
        this.artist = artist;
        this.genre = genre;
        this.createdAt = LocalDateTime.now();
    }
}
