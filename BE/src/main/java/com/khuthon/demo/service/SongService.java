package com.khuthon.demo.service;

import com.khuthon.demo.dto.RankedSongResponse;
import com.khuthon.demo.dto.SongResponse;
import com.khuthon.demo.entity.Song;
import com.khuthon.demo.repository.SongRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SongService {

    private static final int RANDOM_PICK_COUNT = 5; // 랜덤 추출 개수

    private final SongRepository songRepository;

    public SongService(SongRepository songRepository) {
        this.songRepository = songRepository;
    }

    /**
     * 장르 이름으로 곡 목록을 조회합니다.
     * - genre 지정 시: 해당 장르에서 랜덤으로 5곡 추출
     * - genre 미지정 시: 전체 목록 반환
     */
    @Transactional(readOnly = true)
    public List<SongResponse> getSongs(String genre) {
        List<Song> songs;

        if (genre != null && !genre.isBlank()) {
            songs = songRepository.findByGenre_Name(genre);
            // 리스트를 복사한 뒤 랜덤 셔플 후 앞에서 5개만 추출
            songs = new java.util.ArrayList<>(songs);
            Collections.shuffle(songs);
            songs = songs.stream()
                    .limit(RANDOM_PICK_COUNT)
                    .collect(Collectors.toList());
        } else {
            songs = songRepository.findAll();
        }

        return toResponseList(songs);
    }

    /**
     * 커뮤니티 그룹(preferred_genre)의 좋아요 수 기준으로 음악 장르(genre)의 곡 랭킹을 반환합니다.
     * 예) preferred_genre=힙합커뮤, genre=Korean Indie → 힙합커뮤가 많이 좋아한 인디 곡 순서
     */
    @Transactional(readOnly = true)
    public List<RankedSongResponse> getRanks(String preferredGenre, String genre) {
        // 커뮤니티 그룹에 따라 정렬 기준 컬럼 결정
        String sortColumn = switch (preferredGenre) {
            case "힙합커뮤" -> "hiphopLikeCount";
            case "밴드커뮤" -> "bandLikeCount";
            case "일반인"   -> "generalLikeCount";
            default -> throw new IllegalArgumentException("알 수 없는 그룹: " + preferredGenre);
        };

        Sort sort = Sort.by(Sort.Direction.DESC, sortColumn);
        List<Song> songs = songRepository.findByGenre_Name(genre, sort);

        return toRankedResponseList(songs, preferredGenre);
    }

    private List<SongResponse> toResponseList(List<Song> songs) {
        return songs.stream()
                .map(s -> new SongResponse(
                        s.getSongId(),
                        s.getTitle(),
                        s.getArtist(),
                        s.getGenre().getName()))
                .collect(Collectors.toList());
    }

    private List<RankedSongResponse> toRankedResponseList(List<Song> songs, String preferredGenre) {
        var result = new java.util.ArrayList<RankedSongResponse>();
        for (int i = 0; i < songs.size(); i++) {
            Song s = songs.get(i);
            long likeCount = switch (preferredGenre) {
                case "힙합커뮤" -> s.getHiphopLikeCount();
                case "밴드커뮤" -> s.getBandLikeCount();
                case "일반인"   -> s.getGeneralLikeCount();
                default -> 0L;
            };
            result.add(new RankedSongResponse(
                    i + 1,              // rank (1-based)
                    s.getSongId(),
                    s.getTitle(),
                    s.getArtist(),
                    s.getGenre().getName(),
                    likeCount           // 해당 커뮤니티 추천 수
            ));
        }
        return result;
    }
}
