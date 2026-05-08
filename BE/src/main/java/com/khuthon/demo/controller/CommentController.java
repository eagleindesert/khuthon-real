package com.khuthon.demo.controller;

import com.khuthon.demo.dto.CommentRequest;
import com.khuthon.demo.dto.CommentResponse;
import com.khuthon.demo.service.CommentService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/songs")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    /**
     * 특정 곡의 댓글 목록 조회 (최신순)
     * GET /api/songs/{songId}/comments
     */
    @GetMapping("/{songId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long songId) {
        return ResponseEntity.ok(commentService.getComments(songId));
    }

    /**
     * 댓글 작성 (로그인 필요)
     * POST /api/songs/{songId}/comments
     * Body: { "content": "..." }
     */
    @PostMapping("/{songId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long songId,
            @RequestBody CommentRequest request,
            HttpSession session) {
        CommentResponse response = commentService.addComment(songId, request, session);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleUnauthorized(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
    }
}
