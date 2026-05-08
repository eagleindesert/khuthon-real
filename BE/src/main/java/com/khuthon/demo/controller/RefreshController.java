package com.khuthon.demo.controller;

import com.khuthon.demo.dto.TrackInfo;
import com.khuthon.demo.service.FandomPickService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RefreshController {

    private final FandomPickService fandomPickService;

    public RefreshController(FandomPickService fandomPickService) {
        this.fandomPickService = fandomPickService;
    }

    /**
     * Spotify API에서 트랙을 조회하고 PostgreSQL에 저장한 뒤 결과를 반환합니다.
     */
    @PostMapping("/refresh")
    public List<TrackInfo> refresh() {
        return fandomPickService.refreshAndSave();
    }
}
