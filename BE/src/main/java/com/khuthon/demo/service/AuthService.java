package com.khuthon.demo.service;

import com.khuthon.demo.dto.LoginRequest;
import com.khuthon.demo.dto.RegisterRequest;
import com.khuthon.demo.dto.UserResponse;
import com.khuthon.demo.entity.User;
import com.khuthon.demo.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final String SESSION_KEY = "userId";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * 회원가입: loginId 중복 확인 → 비밀번호 해시 → user 테이블에 저장
     */
    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByLoginId(request.loginId())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        String hashedPassword = passwordEncoder.encode(request.password());
        User user = new User(
                request.loginId(),
                hashedPassword,
                request.nickname(),
                request.preferredGenre() // null 허용
        );
        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    /**
     * 로그인: loginId 조회 → 비밀번호 BCrypt 비교 → HttpSession에 userId 저장
     * Spring Session이 자동으로 Redis에 세션을 직렬화해 저장함
     */
    @Transactional(readOnly = true)
    public UserResponse login(LoginRequest request, HttpSession session) {
        User user = userRepository.findByLoginId(request.loginId())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        // 세션에 userId 저장 → Redis에 자동 반영
        session.setAttribute(SESSION_KEY, user.getUserId());
        return toResponse(user);
    }

    /**
     * 로그아웃: 세션 무효화 → Redis에서 해당 세션 삭제
     */
    public void logout(HttpSession session) {
        session.invalidate();
    }

    /**
     * 현재 로그인 유저 조회: 세션에서 userId를 꺼내 DB 조회
     */
    @Transactional(readOnly = true)
    public UserResponse getMe(HttpSession session) {
        Long userId = (Long) session.getAttribute(SESSION_KEY);
        if (userId == null) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("유저 정보를 찾을 수 없습니다."));
        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getUserId(),
                user.getLoginId(),
                user.getNickname(),
                user.getPreferredGenre());
    }
}
