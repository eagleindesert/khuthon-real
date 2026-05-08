package com.khuthon.demo.service;

import com.khuthon.demo.dto.TrackInfo;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FandomPickService {

    private final SpotifyService spotifyService;

    private static final List<String> QUERIES = Arrays.asList(
            "Korean Indie", "Underground Hiphop 한국", "Korean R&B", "Korean Rock");

    public FandomPickService(SpotifyService spotifyService) {
        this.spotifyService = spotifyService;
    }

    public List<TrackInfo> getFandomPicks() {
        return spotifyService.searchTracksByQueries(QUERIES).stream()
                .map(t -> new TrackInfo(t.artistName(), t.trackName(), t.query()))
                .collect(Collectors.toList());
    }
}
