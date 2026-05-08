package com.khuthon.demo.controller;

import com.khuthon.demo.dto.LikeRequest;
import com.khuthon.demo.service.LikeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class LikeController {

    private final LikeService likeService;

    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }

    /**
     * 곡 좋아요 추가
     * POST /api/like
     * Body: { "songId": 1, "preferredGenre": "힙합커뮤", "like": 1 }
     */
    @PostMapping("/like")
    public ResponseEntity<Map<String, String>> like(@RequestBody LikeRequest request) {
        likeService.addLike(request);
        return ResponseEntity.ok(Map.of("message", "좋아요가 반영되었습니다."));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
