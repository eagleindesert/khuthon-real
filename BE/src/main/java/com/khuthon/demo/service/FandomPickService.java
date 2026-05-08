package com.khuthon.demo.service;

import com.khuthon.demo.dto.TrackInfo;
import com.khuthon.demo.entity.Genre;
import com.khuthon.demo.entity.Song;
import com.khuthon.demo.repository.GenreRepository;
import com.khuthon.demo.repository.SongRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FandomPickService {

        private final SpotifyService spotifyService;
        private final SongRepository songRepository;
        private final GenreRepository genreRepository;

        // 기본 장르 하드코딩!
        // 8개만!
        private static final List<String> QUERIES = Arrays.asList(
                        "Korean Indie", "Underground Hiphop 한국", "Korean R&B", "Korean Rock", "Korean Jazz",
                        "Korean Traditional Gugak",
                        "Korean Trot", "Korean Retro");

        public FandomPickService(SpotifyService spotifyService,
                        SongRepository songRepository,
                        GenreRepository genreRepository) {
                this.spotifyService = spotifyService;
                this.songRepository = songRepository;
                this.genreRepository = genreRepository;
        }

        /**
         * Spotify API에서 트랙을 조회하고 song 테이블에 저장합니다.
         * 매 호출마다 기존 데이터를 초기화하고 최신 데이터로 교체합니다.
         */
        @Transactional
        public List<TrackInfo> refreshAndSave() {
                // 1. Spotify API 조회 → TrackInfo DTO 변환
                List<TrackInfo> tracks = spotifyService.searchTracksByQueries(QUERIES).stream()
                                .map(t -> new TrackInfo(t.artistName(), t.trackName(), t.query()))
                                .collect(Collectors.toList());

                // 2. 기존 song 데이터 전체 삭제 (refresh = 최신 데이터로 교체)
                songRepository.deleteAll();

                // 3. DTO → Song 엔티티 변환 후 song 테이블에 저장
                List<Song> songs = tracks.stream()
                                .map(t -> {
                                        // genre 이름으로 조회, 없으면 신규 삽입
                                        Genre genre = genreRepository.findByName(t.genre())
                                                        .orElseGet(() -> genreRepository.save(new Genre(t.genre())));
                                        return new Song(t.title(), t.artist(), genre);
                                })
                                .collect(Collectors.toList());
                songRepository.saveAll(songs);

                return tracks;
        }
}
