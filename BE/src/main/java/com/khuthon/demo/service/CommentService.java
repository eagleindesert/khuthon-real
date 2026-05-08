package com.khuthon.demo.service;

import com.khuthon.demo.dto.CommentRequest;
import com.khuthon.demo.dto.CommentResponse;
import com.khuthon.demo.entity.Comment;
import com.khuthon.demo.entity.Song;
import com.khuthon.demo.entity.User;
import com.khuthon.demo.repository.CommentRepository;
import com.khuthon.demo.repository.SongRepository;
import com.khuthon.demo.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private static final String SESSION_KEY = "userId";

    private final CommentRepository commentRepository;
    private final SongRepository songRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository,
                          SongRepository songRepository,
                          UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.songRepository = songRepository;
        this.userRepository = userRepository;
    }

    /**
     * 특정 곡의 댓글 목록 조회 (최신순)
     */
    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long songId) {
        // 곡 존재 여부 확인
        if (!songRepository.existsById(songId)) {
            throw new IllegalArgumentException("곡을 찾을 수 없습니다.");
        }

        return commentRepository.findBySong_SongIdOrderByCreatedAtDesc(songId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * 댓글 작성 (세션에서 userId를 꺼내 작성자 확인)
     */
    @Transactional
    public CommentResponse addComment(Long songId, CommentRequest request, HttpSession session) {
        // 로그인 확인
        Long userId = (Long) session.getAttribute(SESSION_KEY);
        if (userId == null) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }

        // 곡 존재 확인
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new IllegalArgumentException("곡을 찾을 수 없습니다."));

        // 유저 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("유저 정보를 찾을 수 없습니다."));

        // 내용 검증
        if (request.content() == null || request.content().isBlank()) {
            throw new IllegalArgumentException("댓글 내용을 입력해주세요.");
        }

        Comment comment = new Comment(song, user, request.content());
        Comment saved = commentRepository.save(comment);

        return toResponse(saved);
    }

    private CommentResponse toResponse(Comment comment) {
        return new CommentResponse(
                comment.getCommentId(),
                comment.getUser().getNickname(),
                comment.getUser().getPreferredGenre(),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }
}
