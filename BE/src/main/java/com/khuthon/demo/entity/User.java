package com.khuthon.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "\"user\"")   // user는 PostgreSQL 예약어 → 큰따옴표 필요
@Getter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "login_id", nullable = false, unique = true, length = 100)
    private String loginId;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "nickname", nullable = false, length = 100)
    private String nickname;

    @Column(name = "preferred_genre", length = 100)
    private String preferredGenre;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public User(String loginId, String passwordHash, String nickname, String preferredGenre) {
        this.loginId = loginId;
        this.passwordHash = passwordHash;
        this.nickname = nickname;
        this.preferredGenre = preferredGenre;
        this.createdAt = LocalDateTime.now();
    }
}
