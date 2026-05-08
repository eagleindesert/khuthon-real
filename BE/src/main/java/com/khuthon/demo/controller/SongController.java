package com.khuthon.demo.controller;

import com.khuthon.demo.dto.RankedSongResponse;
import com.khuthon.demo.dto.SongResponse;
import com.khuthon.demo.service.SongService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SongController {

    private final SongService songService;

    public SongController(SongService songService) {
        this.songService = songService;
    }

    /**
     * 장르별 곡 목록 조회 (랜덤 5곡)
     * GET /api/list              → 전체 곡 목록 반환
     * GET /api/list?genre=인디   → 해당 장르에서 랜덤 5곡 반환
     */
    @GetMapping("/list")
    public ResponseEntity<List<SongResponse>> list(
            @RequestParam(required = false) String genre) {
        return ResponseEntity.ok(songService.getSongs(genre));
    }

    /**
     * 커뮤니티 그룹별 좋아요 수 기준 랭킹 조회
     * GET /api/list/ranks?preferred_genre=힙합커뮤&genre=Korean Indie
     * → 힙합커뮤가 좋아요를 많이 누른 순서로 Korean Indie 곡 목록 반환
     */
    @GetMapping("/list/ranks")
    public ResponseEntity<List<RankedSongResponse>> ranks(
            @RequestParam String preferredGenre,
            @RequestParam String genre) {
        return ResponseEntity.ok(songService.getRanks(preferredGenre, genre));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
