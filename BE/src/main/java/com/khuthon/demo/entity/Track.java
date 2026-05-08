package com.khuthon.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "track")
@Getter
@NoArgsConstructor
public class Track {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String artistName;

    @Column(nullable = false)
    private String trackName;

    @Column(nullable = false)
    private String genre;

    @Column(nullable = false)
    private LocalDateTime fetchedAt;

    public Track(String artistName, String trackName, String genre) {
        this.artistName = artistName;
        this.trackName = trackName;
        this.genre = genre;
        this.fetchedAt = LocalDateTime.now();
    }
}
