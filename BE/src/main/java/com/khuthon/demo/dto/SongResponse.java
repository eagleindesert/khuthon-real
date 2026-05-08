package com.khuthon.demo.dto;

public record SongResponse(
        Long songId,
        String title,
        String artist,
        String genre
) {}
