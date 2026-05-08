package com.khuthon.demo.service;

import com.khuthon.demo.dto.TrackInfo;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class FandomPickService {

    private final SpotifyService spotifyService;
    private final YoutubeService youtubeService;
    
    private static final long VIEW_COUNT_CUTOFF = 2_000_000L;
    
    private static final List<String> QUERIES = Arrays.asList(
        "Korean Indie", "Underground Hiphop 한국", "Korean R&B", "Korean Rock"
    );

    public FandomPickService(SpotifyService spotifyService, YoutubeService youtubeService) {
        this.spotifyService = spotifyService;
        this.youtubeService = youtubeService;
    }

    public List<TrackInfo> getFandomPicks() {
        List<SpotifyService.SpotifyTrack> spotifyTracks = spotifyService.searchTracksByQueries(QUERIES);
        List<TrackInfo> result = new ArrayList<>();
        
        for (SpotifyService.SpotifyTrack track : spotifyTracks) {
            Long viewCount = youtubeService.getViewCount(track.artistName(), track.trackName());
            
            if (viewCount != null && viewCount <= VIEW_COUNT_CUTOFF) {
                result.add(new TrackInfo(track.artistName(), track.trackName(), track.query(), viewCount));
            }
        }
        
        return result;
    }
}
