
package com.skillbridge.backend.controller;

import com.skillbridge.backend.dto.AnalysisResponse;
import com.skillbridge.backend.entity.ResumeAnalysis;
import com.skillbridge.backend.repository.ResumeAnalysisRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;

@RestController
@RequestMapping("/api/analysis/history")
public class AnalysisHistoryController {

    private final ResumeAnalysisRepository repository;
    private final JsonMapper jsonMapper = new JsonMapper();

    public AnalysisHistoryController(
            ResumeAnalysisRepository repository) {
        this.repository = repository;
    }

    // Get all analyses for the logged-in user
    @GetMapping
    public ResponseEntity<?> getHistory(
            Authentication authentication) {

        Long userId = getUserId(authentication);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid authentication");
        }

        List<HistoryItem> history =
                repository.findAllByUser_IdOrderByCreatedAtDesc(userId)
                        .stream()
                        .map(item -> new HistoryItem(
                                item.getId(),
                                item.getJobRole(),
                                item.getScore(),
                                item.getCreatedAt()
                        ))
                        .toList();

        return ResponseEntity.ok(history);
    }

    // Get one saved analysis with its complete result
    @GetMapping("/{id}")
    public ResponseEntity<?> getAnalysis(
            @PathVariable Long id,
            Authentication authentication) {

        Long userId = getUserId(authentication);

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid authentication");
        }

        return repository.findByIdAndUser_Id(id, userId)
                .map(item -> {
                    try {
                        AnalysisResponse result =
                                jsonMapper.readValue(
                                        item.getResultJson(),
                                        AnalysisResponse.class
                                );

                        return ResponseEntity.ok(
                                new HistoryDetail(
                                        item.getId(),
                                        item.getJobRole(),
                                        item.getScore(),
                                        item.getCreatedAt(),
                                        result
                                )
                        );
                    } catch (Exception e) {
                        return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body((Object) "Could not read saved analysis");
                    }
                })
                .orElseGet(() ->
                        ResponseEntity.notFound().build());
    }

    private Long getUserId(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()) {
            return null;
        }

        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public record HistoryItem(
            Long id,
            String jobRole,
            double score,
            java.time.LocalDateTime createdAt
    ) {}

    public record HistoryDetail(
            Long id,
            String jobRole,
            double score,
            java.time.LocalDateTime createdAt,
            AnalysisResponse result
    ) {}
}
