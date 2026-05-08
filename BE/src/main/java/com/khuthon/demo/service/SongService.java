package com.khuthon.demo.service;

import com.khuthon.demo.dto.SongResponse;
import com.khuthon.demo.entity.Song;
import com.khuthon.demo.repository.SongRepository;
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

        return songs.stream()
                .map(s -> new SongResponse(
                        s.getSongId(),
                        s.getTitle(),
                        s.getArtist(),
                        s.getGenre().getName()))
                .collect(Collectors.toList());
    }
}
