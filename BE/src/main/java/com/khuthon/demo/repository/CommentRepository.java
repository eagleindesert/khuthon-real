package com.khuthon.demo.repository;

import com.khuthon.demo.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    // 특정 곡의 댓글을 최신순으로 조회
    List<Comment> findBySong_SongIdOrderByCreatedAtDesc(Long songId);
}
