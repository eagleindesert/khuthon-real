package com.khuthon.demo.dto;

public record RankedSongResponse(
        int rank,           // 순위 (1-based)
        Long songId,
        String title,
        String artist,
        String genre,
        long likeCount      // 요청한 커뮤니티의 추천 수
) {}
