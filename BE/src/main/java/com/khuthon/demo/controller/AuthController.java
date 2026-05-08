package com.khuthon.demo.controller;

import com.khuthon.demo.dto.LoginRequest;
import com.khuthon.demo.dto.RegisterRequest;
import com.khuthon.demo.dto.UserResponse;
import com.khuthon.demo.service.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * 회원가입
     * POST /api/auth/register
     * Body: { "loginId": "...", "password": "...", "nickname": "...", "preferredGenre": "..." }
     */
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
        UserResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 로그인
     * POST /api/auth/login
     * Body: { "loginId": "...", "password": "..." }
     * 성공 시 응답 헤더에 Set-Cookie: JSESSIONID=... 포함
     */
    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@RequestBody LoginRequest request,
                                               HttpSession session) {
        UserResponse response = authService.login(request, session);
        return ResponseEntity.ok(response);
    }

    /**
     * 로그아웃
     * POST /api/auth/logout
     * Redis에서 세션 삭제
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpSession session) {
        authService.logout(session);
        return ResponseEntity.ok(Map.of("message", "로그아웃 되었습니다."));
    }

    /**
     * 내 정보 조회 (세션 필요)
     * GET /api/auth/me
     * Cookie: JSESSIONID=... 헤더 포함 필요
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(HttpSession session) {
        UserResponse response = authService.getMe(session);
        return ResponseEntity.ok(response);
    }

    /**
     * 전역 예외 처리 (이 컨트롤러 내)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleUnauthorized(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
    }
}
