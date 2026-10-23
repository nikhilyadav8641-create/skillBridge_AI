
package com.skillbridge.backend.controller;

import com.skillbridge.backend.dto.AnalysisResponse;
import com.skillbridge.backend.service.AnalysisService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    // Analyze the uploaded resume for a target job role
    @PostMapping(
            value = "/analyze",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<?> analyzeResume(
            @RequestParam("resume") MultipartFile resume,
            @RequestParam("jobRole") String jobRole,
            Authentication authentication
    ) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Please login again."));
        }

        try {
            Long userId = Long.valueOf(authentication.getName());

            AnalysisResponse result =
                    analysisService.analyzeResume(userId, resume, jobRole);

            return ResponseEntity.ok(result);

        } catch (NumberFormatException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid user authentication."));

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", exception.getMessage()));

        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", exception.getMessage()));
        }
    }

    // Compare multiple career roles
    @PostMapping(
            value = "/compare",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<?> compareRoles(
            @RequestParam("resume") MultipartFile resume,
            @RequestParam("jobRoles") List<String> jobRoles,
            Authentication authentication
    ) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Please login again."));
        }

        try {
            Long userId = Long.valueOf(authentication.getName());

            if (jobRoles == null
                    || jobRoles.size() < 2
                    || jobRoles.size() > 3) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Please provide between 2 and 3 job roles."
                        ));
            }

            return ResponseEntity.ok(
                    analysisService.compareRoles(userId, resume, jobRoles)
            );

        } catch (NumberFormatException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid user authentication."));

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", exception.getMessage()));

        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", exception.getMessage()));
        }
    }

    // Delete one analysis history record
    @DeleteMapping("/history/{id}")
    public ResponseEntity<?> deleteAnalysis(
            @PathVariable Long id,
            Authentication authentication
    ) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Please login again."));
        }

        try {
            Long userId = Long.valueOf(authentication.getName());

            analysisService.deleteAnalysis(userId, id);

            return ResponseEntity.noContent().build();

        } catch (NumberFormatException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid user authentication."));

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", exception.getMessage()));
        }
    }

    // Delete all analysis history for the logged-in user
    @DeleteMapping("/history")
    public ResponseEntity<?> deleteAllHistory(
            Authentication authentication
    ) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Authentication required. Please login again."
                    ));
        }

        try {
            Long userId = Long.valueOf(authentication.getName());

            analysisService.deleteAllHistory(userId);

            return ResponseEntity.noContent().build();

        } catch (NumberFormatException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid user authentication."));
        }
    }
}
