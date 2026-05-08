package com.khuthon.demo.dto;

import java.time.LocalDateTime;

/**
 * 댓글 응답 DTO
 */
public record CommentResponse(
        Long commentId,
        String nickname,
        String preferredGenre,
        String content,
        LocalDateTime createdAt
) {}
