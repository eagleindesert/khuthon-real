package com.khuthon.demo.controller;

import com.khuthon.demo.dto.SongResponse;
import com.khuthon.demo.service.SongService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class SongController {

    private final SongService songService;

    public SongController(SongService songService) {
        this.songService = songService;
    }

    /**
     * 장르별 곡 목록 조회
     * GET /api/list              → 전체 곡 목록 반환
     * GET /api/list?genre=인디   → 해당 장르 곡만 반환
     */
    @GetMapping("/list")
    public ResponseEntity<List<SongResponse>> list(
            @RequestParam(required = false) String genre) {
        return ResponseEntity.ok(songService.getSongs(genre));
    }
}
