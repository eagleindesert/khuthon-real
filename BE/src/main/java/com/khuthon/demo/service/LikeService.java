package com.khuthon.demo.service;

import com.khuthon.demo.dto.LikeRequest;
import com.khuthon.demo.entity.Song;
import com.khuthon.demo.repository.SongRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LikeService {

    private final SongRepository songRepository;

    public LikeService(SongRepository songRepository) {
        this.songRepository = songRepository;
    }

    /**
     * 특정 곡의 커뮤니티 그룹별 좋아요 수를 증가시킵니다.
     */
    @Transactional
    public void addLike(LikeRequest request) {
        Song song = songRepository.findById(request.songId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 곡입니다. song_id=" + request.songId()));

        song.addLike(request.preferredGenre(), request.like());
        // @Transactional 범위 내에서 엔티티가 변경되면 JPA가 자동으로 UPDATE 쿼리를 실행합니다.
    }
}
