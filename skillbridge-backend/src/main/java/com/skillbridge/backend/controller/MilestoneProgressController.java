
package com.skillbridge.backend.controller;

import com.skillbridge.backend.entity.MilestoneProgress;
import com.skillbridge.backend.repository.MilestoneProgressRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class MilestoneProgressController {

    private final MilestoneProgressRepository repository;

    public MilestoneProgressController(
            MilestoneProgressRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/{projectId}/progress")
    public List<MilestoneProgress> getProgress(
            @PathVariable Long projectId,
            Authentication authentication) {

        Long userId = getUserId(authentication);

        return repository.findByUserIdAndProjectId(
                userId, projectId);
    }

    @PutMapping("/{projectId}/progress")
    public MilestoneProgress updateProgress(
            @PathVariable Long projectId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        Long userId = getUserId(authentication);

        String title = (String) request.get("milestoneTitle");

        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException(
                    "Milestone title is required");
        }

        boolean completed =
                Boolean.TRUE.equals(request.get("completed"));

        MilestoneProgress progress = repository
                .findByUserIdAndProjectIdAndMilestoneTitle(
                        userId, projectId, title)
                .orElseGet(() ->
                        new MilestoneProgress(
                                userId, projectId, title));

        progress.setCompleted(completed);

        return repository.save(progress);
    }

    private Long getUserId(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Please login first.");
        }

        try {
            return Long.valueOf(authentication.getName());
        } catch (NumberFormatException exception) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Invalid user authentication.");
        }
    }
}
