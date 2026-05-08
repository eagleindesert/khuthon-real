package com.khuthon.demo.repository;

import com.khuthon.demo.entity.Song;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SongRepository extends JpaRepository<Song, Long> {
}
