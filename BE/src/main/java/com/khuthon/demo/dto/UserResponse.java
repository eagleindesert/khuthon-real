package com.khuthon.demo.dto;

/**
 * 로그인/내 정보 조회 응답 DTO
 * password_hash는 절대 포함하지 않음
 */
public record UserResponse(
        Long userId,
        String loginId,
        String nickname,
        String preferredGenre
) {}
