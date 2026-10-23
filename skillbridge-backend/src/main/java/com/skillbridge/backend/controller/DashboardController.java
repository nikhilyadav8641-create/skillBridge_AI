
package com.skillbridge.backend.controller;

import com.skillbridge.backend.dto.AnalysisResponse;
import com.skillbridge.backend.entity.CareerRoadmap;
import com.skillbridge.backend.entity.MilestoneProgress;
import com.skillbridge.backend.entity.Project;
import com.skillbridge.backend.entity.ResumeAnalysis;
import com.skillbridge.backend.entity.RoadmapTask;

import com.skillbridge.backend.repository.CareerRoadmapRepository;
import com.skillbridge.backend.repository.MilestoneProgressRepository;
import com.skillbridge.backend.repository.ProjectRepository;
import com.skillbridge.backend.repository.ResumeAnalysisRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import tools.jackson.databind.json.JsonMapper;

import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final CareerRoadmapRepository roadmapRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final ProjectRepository projectRepository;
    private final MilestoneProgressRepository milestoneProgressRepository;

    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    public DashboardController(
            CareerRoadmapRepository roadmapRepository,
            ResumeAnalysisRepository resumeAnalysisRepository,
            ProjectRepository projectRepository,
            MilestoneProgressRepository milestoneProgressRepository) {

        this.roadmapRepository = roadmapRepository;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.projectRepository = projectRepository;
        this.milestoneProgressRepository = milestoneProgressRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message", "Please login again."
                    ));
        }

        Long userId;

        try {
            userId = Long.valueOf(authentication.getName());

        } catch (NumberFormatException exception) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message", "Invalid user authentication."
                    ));
        }

        // -----------------------------------------
        // 1. ROADMAP TASK PROGRESS
        // -----------------------------------------

        List<CareerRoadmap> roadmaps =
                roadmapRepository
                        .findAllByUser_IdOrderByCreatedAtDesc(userId);

        int totalTasks = 0;
        int completedTasks = 0;
        int pendingTasks = 0;

        for (CareerRoadmap roadmap : roadmaps) {

            for (RoadmapTask task : roadmap.getTasks()) {

                totalTasks++;

                if (task.isCompleted()) {
                    completedTasks++;
                } else {
                    pendingTasks++;
                }
            }
        }

        int progress = totalTasks == 0
                ? 0
                : Math.round(
                completedTasks * 100.0f / totalTasks
        );

        // -----------------------------------------
        // 2. LATEST RESUME ANALYSIS
        // -----------------------------------------

        Optional<ResumeAnalysis> latestAnalysis =
                resumeAnalysisRepository
                        .findFirstByUser_IdAndCareerComparisonFalseOrderByCreatedAtDesc(
                                userId
                        );

        Object resumeScore = null;
        Object skillMatch = null;
        int skillsToLearn = 0;

        if (latestAnalysis.isPresent()) {

            try {
                ResumeAnalysis analysis = latestAnalysis.get();

                AnalysisResponse result = jsonMapper.readValue(
                        analysis.getResultJson(),
                        AnalysisResponse.class
                );

                resumeScore = result.score();
                skillMatch = result.score();

                skillsToLearn =
                        (result.partial() == null
                                ? 0
                                : result.partial().size())
                                +
                                (result.gaps() == null
                                        ? 0
                                        : result.gaps().size());

            } catch (Exception exception) {

                System.err.println(
                        "Unable to read latest resume analysis: "
                                + exception.getMessage()
                );
            }
        }

        // -----------------------------------------
        // 3. PROJECT COUNTS AND COMPLETION
        // -----------------------------------------

        List<Project> projects =
                projectRepository.findAllByUser_Id(userId);

        long totalProjects = projects.size();
        long completedProjects = 0;

        for (Project project : projects) {

            List<String> milestones = project.getMilestones();

            // A project without milestones is not complete.
            if (milestones == null || milestones.isEmpty()) {
                continue;
            }

            List<MilestoneProgress> savedProgress =
                    milestoneProgressRepository
                            .findByUserIdAndProjectId(
                                    userId,
                                    project.getId()
                            );

            Set<String> completedTitles = new HashSet<>();

            for (MilestoneProgress milestoneProgress : savedProgress) {

                if (milestoneProgress.isCompleted()) {
                    completedTitles.add(
                            milestoneProgress.getMilestoneTitle()
                    );
                }
            }

            boolean allCompleted = milestones.stream()
                    .allMatch(completedTitles::contains);

            if (allCompleted) {
                completedProjects++;
            }
        }

        long pendingProjects = totalProjects - completedProjects;

        int projectCompletion = totalProjects == 0
                ? 0
                : (int) Math.round(
                completedProjects * 100.0 / totalProjects
        );

        // -----------------------------------------
        // 4. BUILD DASHBOARD RESPONSE
        // -----------------------------------------

        Map<String, Object> stats = new LinkedHashMap<>();

        // Resume and skills
        stats.put("resumeScore", resumeScore);
        stats.put("skillMatch", skillMatch);
        stats.put("skillsToLearn", skillsToLearn);

        // Projects
        stats.put("projects", totalProjects);
        stats.put("totalProjects", totalProjects);
        stats.put("completedProjects", completedProjects);
        stats.put("pendingProjects", pendingProjects);
        stats.put("projectCompletion", projectCompletion);

        // Roadmaps and roadmap task progress
        stats.put("totalRoadmaps", roadmaps.size());
        stats.put("totalTasks", totalTasks);
        stats.put("completedTasks", completedTasks);
        stats.put("pendingTasks", pendingTasks);
        stats.put("progress", progress);

        return ResponseEntity.ok(stats);
    }
}
