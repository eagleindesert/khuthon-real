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

    @PostMapping("/refresh")
    public List<TrackInfo> refresh() {
        return fandomPickService.getFandomPicks();
    }
}
