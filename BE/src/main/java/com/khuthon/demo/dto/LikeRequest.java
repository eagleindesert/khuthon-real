package com.khuthon.demo.dto;

public record LikeRequest(
        Long songId,           // 좋아요할 곡 ID
        String preferredGenre, // 커뮤니티 그룹: "힙합커뮤" | "밴드커뮤" | "일반인"
        long like              // 좋아요 횟수 (보통 1)
) {}
