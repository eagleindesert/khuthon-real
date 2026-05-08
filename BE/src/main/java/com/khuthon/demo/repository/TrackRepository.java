package com.khuthon.demo.repository;

import com.khuthon.demo.entity.Track;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrackRepository extends JpaRepository<Track, Long> {
}
