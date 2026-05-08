package com.khuthon.demo.repository;

import com.khuthon.demo.entity.SongStats;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SongStatsRepository extends JpaRepository<SongStats, Long> {
}
