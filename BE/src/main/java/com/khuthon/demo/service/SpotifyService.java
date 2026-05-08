package com.khuthon.demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;

@Service
public class SpotifyService {

    @Value("${SPOTIFY_CLIENT_ID}")
    private String clientId;

    @Value("${SPOTIFY_CLIENT_SECRET}")
    private String clientSecret;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private String accessToken;

    private void authenticate() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setBasicAuth(clientId, clientSecret);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity("https://accounts.spotify.com/api/token", request, String.class);

        try {
            JsonNode root = objectMapper.readTree(response.getBody());
            this.accessToken = root.path("access_token").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to get Spotify access token", e);
        }
    }

    public List<SpotifyTrack> searchTracksByQueries(List<String> queries) {
        if (accessToken == null) {
            authenticate();
        }
        
        List<SpotifyTrack> tracks = new ArrayList<>();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<?> entity = new HttpEntity<>(headers);

        for (String query : queries) {
            try {
                String url = UriComponentsBuilder.fromUriString("https://api.spotify.com/v1/search")
                        .queryParam("q", query)
                        .queryParam("type", "track")
                        .queryParam("limit", 20)
                        .toUriString();
                        
                ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
                
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode items = root.path("tracks").path("items");
                
                if (items.isArray()) {
                    for (JsonNode item : items) {
                        String trackName = item.path("name").asText();
                        String artistName = item.path("artists").get(0).path("name").asText();
                        tracks.add(new SpotifyTrack(artistName, trackName, query));
                    }
                }
            } catch (Exception e) {
                System.err.println("Error searching Spotify for query: " + query);
                e.printStackTrace();
            }
        }
        
        return tracks;
    }
    
    public record SpotifyTrack(String artistName, String trackName, String query) {}
}
