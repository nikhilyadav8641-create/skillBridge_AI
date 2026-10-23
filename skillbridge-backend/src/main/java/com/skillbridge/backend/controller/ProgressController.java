
package com.skillbridge.backend.controller;

import com.skillbridge.backend.dto.ProgressResponse;
import com.skillbridge.backend.service.ProgressService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping
    public ResponseEntity<?> getProgress(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("message", "Please log in."));
        }

        try {
            Long userId = Long.valueOf(authentication.getName());

            ProgressResponse progress =
                    progressService.getProgress(userId);

            return ResponseEntity.ok(progress);

        } catch (NumberFormatException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("message", "Invalid user session."));
        }
    }
}
