package com.khuthon.demo.dto;

/**
 * 회원가입 요청 DTO
 * preferredGenre는 선택 입력 (null 허용)
 */
public record RegisterRequest(
        String loginId,
        String password,
        String nickname,
        String preferredGenre
) {}
