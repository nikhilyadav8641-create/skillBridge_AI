package com.skillbridge.backend.controller;

import com.skillbridge.backend.entity.Project;
import com.skillbridge.backend.service.ProjectService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<Project> getProjects(Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        return projectService.getAllProjects(userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Project createProject(
            @RequestBody Project project,
            Authentication authentication) {

        Long userId = Long.valueOf(authentication.getName());
        return projectService.saveProject(project, userId);
    }

    @PostMapping("/recommendations/generate")
    public ResponseEntity<?> generateRecommendations(
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Please login again."));
        }

        String jobRole = request == null ? null : request.get("jobRole");

        try {
            Long userId = Long.valueOf(authentication.getName());

            List<Project> projects =
                    projectService.generateRecommendations(userId, jobRole);

            return ResponseEntity.status(HttpStatus.CREATED).body(projects);

        } catch (NumberFormatException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Invalid user authentication."));

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", exception.getMessage()));

        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                            "message",
                            "Unable to generate projects: "
                                    + exception.getMessage()));
        }
    }

    // Delete one project belonging to the logged-in user.
    @DeleteMapping("/{projectId}")
    public ResponseEntity<?> deleteProject(
            @PathVariable Long projectId,
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Please login again."));
        }

        try {
            Long userId = Long.valueOf(authentication.getName());

            projectService.deleteProject(projectId, userId);

            return ResponseEntity.noContent().build();

        } catch (NumberFormatException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Invalid user authentication."));

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", exception.getMessage()));
        }
    }

    // Delete all projects belonging to one generation.
    @DeleteMapping("/generation/{generationId}")
    public ResponseEntity<?> deleteGeneration(
            @PathVariable String generationId,
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Please login again."));
        }

        try {
            Long userId = Long.valueOf(authentication.getName());

            projectService.deleteGeneration(generationId, userId);

            return ResponseEntity.noContent().build();

        } catch (NumberFormatException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Invalid user authentication."));

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", exception.getMessage()));
        }
    }
}
