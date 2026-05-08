package com.khuthon.demo.repository;

import com.khuthon.demo.entity.Song;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SongRepository extends JpaRepository<Song, Long> {
    // 장르 이름으로 곡 목록 조회 (Genre 엔티티의 name 필드 기준)
    List<Song> findByGenre_Name(String genreName);

    // 장르 이름으로 곡 목록 조회 + 정렬 (랭킹용)
    List<Song> findByGenre_Name(String genreName, Sort sort);
}
