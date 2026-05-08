package com.khuthon.demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class YoutubeService {

    @Value("${YOUTUBE_API_KEY}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Long getViewCount(String artistName, String trackName) {
        try {
            String searchQuery = artistName + " " + trackName + " Official Audio";
            
            String searchUrl = UriComponentsBuilder.fromUriString("https://www.googleapis.com/youtube/v3/search")
                    .queryParam("part", "snippet")
                    .queryParam("q", searchQuery)
                    .queryParam("type", "video")
                    .queryParam("key", apiKey)
                    .queryParam("maxResults", 1)
                    .toUriString();
                    
            String searchResponse = restTemplate.getForObject(searchUrl, String.class);
            JsonNode searchRoot = objectMapper.readTree(searchResponse);
            JsonNode items = searchRoot.path("items");
            
            if (items.isEmpty()) {
                return null;
            }
            
            String videoId = items.get(0).path("id").path("videoId").asText();
            
            String videoUrl = UriComponentsBuilder.fromUriString("https://www.googleapis.com/youtube/v3/videos")
                    .queryParam("part", "statistics")
                    .queryParam("id", videoId)
                    .queryParam("key", apiKey)
                    .toUriString();
                    
            String videoResponse = restTemplate.getForObject(videoUrl, String.class);
            JsonNode videoRoot = objectMapper.readTree(videoResponse);
            JsonNode videoItems = videoRoot.path("items");
            
            if (videoItems.isEmpty()) {
                return null;
            }
            
            String viewCountStr = videoItems.get(0).path("statistics").path("viewCount").asText();
            return Long.parseLong(viewCountStr);
            
        } catch (Exception e) {
            System.err.println("Error fetching view count for " + artistName + " - " + trackName);
            e.printStackTrace();
            return null;
        }
    }
}
