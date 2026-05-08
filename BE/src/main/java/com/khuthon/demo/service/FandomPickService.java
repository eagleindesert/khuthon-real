package com.khuthon.demo.service;

import com.khuthon.demo.dto.TrackInfo;
import com.khuthon.demo.entity.Track;
import com.khuthon.demo.repository.TrackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FandomPickService {

    private final SpotifyService spotifyService;
    private final TrackRepository trackRepository;

    private static final List<String> QUERIES = Arrays.asList(
            "Korean Indie", "Underground Hiphop 한국", "Korean R&B", "Korean Rock");

    public FandomPickService(SpotifyService spotifyService, TrackRepository trackRepository) {
        this.spotifyService = spotifyService;
        this.trackRepository = trackRepository;
    }

    /**
     * Spotify API에서 트랙을 조회하고, TrackInfo DTO로 변환한 뒤 PostgreSQL에 저장합니다.
     * 매 호출마다 기존 데이터를 초기화하고 최신 데이터로 교체합니다.
     */
    @Transactional
    public List<TrackInfo> refreshAndSave() {
        // 1. Spotify API 조회 → TrackInfo DTO 변환
        List<TrackInfo> tracks = spotifyService.searchTracksByQueries(QUERIES).stream()
                .map(t -> new TrackInfo(t.artistName(), t.trackName(), t.query()))
                .collect(Collectors.toList());

        // 2. 기존 데이터 삭제 (refresh = 최신 데이터로 교체)
        trackRepository.deleteAll();

        // 3. DTO → Entity 변환 후 PostgreSQL 저장
        List<Track> entities = tracks.stream()
                .map(t -> new Track(t.artistName(), t.trackName(), t.genre()))
                .collect(Collectors.toList());
        trackRepository.saveAll(entities);

        return tracks;
    }
}
