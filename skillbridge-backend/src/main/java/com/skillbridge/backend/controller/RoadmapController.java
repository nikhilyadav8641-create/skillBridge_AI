package com.skillbridge.backend.controller;

import com.skillbridge.backend.dto.GenerateRoadmapRequest;
import com.skillbridge.backend.dto.RoadmapResponse;
import com.skillbridge.backend.service.RoadmapService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/roadmap")
public class RoadmapController {

    private final RoadmapService roadmapService;

    public RoadmapController(RoadmapService roadmapService) {
        this.roadmapService = roadmapService;
    }

    // Generate and save a new roadmap
    @PostMapping("/generate")
    public ResponseEntity<?> generate(
            @RequestBody GenerateRoadmapRequest request,
            Authentication authentication) {

        try {
            if (authentication == null
                    || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of(
                                "message",
                                "Please login again."
                        ));
            }

            if (request == null
                    || request.jobRole() == null
                    || request.jobRole().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Please enter a target job role."
                        ));
            }

            Long userId = Long.valueOf(authentication.getName());

            RoadmapResponse response = roadmapService.generate(
                    userId,
                    request.jobRole().trim()
            );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            exception.getMessage()
                    ));

        } catch (RestClientResponseException exception) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                            "message",
                            "AI service request failed. Please try again."
                    ));

        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                            "message",
                            exception.getMessage() == null
                                    ? "AI roadmap generation failed."
                                    : exception.getMessage()
                    ));
        }
    }

    // Get the latest roadmap
    @GetMapping
    public ResponseEntity<?> getLatest(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Please login again."
                    ));
        }

        Long userId = Long.valueOf(authentication.getName());

        RoadmapResponse roadmap = roadmapService.getLatest(userId);

        if (roadmap == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(roadmap);
    }

    // Get all roadmaps for the logged-in user
    @GetMapping("/history")
    public ResponseEntity<?> getHistory(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Please login again."
                    ));
        }

        Long userId = Long.valueOf(authentication.getName());

        List<RoadmapResponse> history =
                roadmapService.getHistory(userId);

        return ResponseEntity.ok(history);
    }

    // Open a specific roadmap from history
    @GetMapping("/{roadmapId}")
    public ResponseEntity<?> getById(
            @PathVariable Long roadmapId,
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Please login again."
                    ));
        }

        Long userId = Long.valueOf(authentication.getName());

        try {
            return ResponseEntity.ok(
                    roadmapService.getById(userId, roadmapId)
            );

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            exception.getMessage()
                    ));
        }
    }

    // Delete one roadmap
    @DeleteMapping("/{roadmapId}")
    public ResponseEntity<?> deleteRoadmap(
            @PathVariable Long roadmapId,
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Please login again."
                    ));
        }

        Long userId = Long.valueOf(authentication.getName());

        try {
            roadmapService.deleteRoadmap(userId, roadmapId);

            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            exception.getMessage()
                    ));
        }
    }

    // Update task completion
    @PatchMapping("/tasks/{taskId}")
    public ResponseEntity<?> updateTask(
            @PathVariable Long taskId,
            @RequestBody TaskCompletionRequest request,
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Please login again."
                    ));
        }

        if (request == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Task completion status is required."
                    ));
        }

        Long userId = Long.valueOf(authentication.getName());

        try {
            RoadmapResponse updatedRoadmap =
                    roadmapService.updateTask(
                            userId,
                            taskId,
                            request.completed()
                    );

            return ResponseEntity.ok(updatedRoadmap);

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            exception.getMessage()
                    ));
        }
    }

    public record TaskCompletionRequest(boolean completed) {
    }
}