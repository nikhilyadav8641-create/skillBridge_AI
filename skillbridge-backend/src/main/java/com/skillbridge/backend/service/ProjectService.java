
package com.skillbridge.backend.service;

import com.skillbridge.backend.dto.AnalysisResponse;
import com.skillbridge.backend.entity.Project;
import com.skillbridge.backend.entity.ResumeAnalysis;
import com.skillbridge.backend.entity.User;
import com.skillbridge.backend.repository.ProjectRepository;
import com.skillbridge.backend.repository.ResumeAnalysisRepository;
import com.skillbridge.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Service
public class ProjectService {

    private static final int PROJECTS_MAX_TOKENS = 1200;
    private static final int MAX_SKILLS_IN_PROMPT = 8;

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final OllamaService ollamaService;

    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    public ProjectService(
            ProjectRepository projectRepository,
            UserRepository userRepository,
            ResumeAnalysisRepository resumeAnalysisRepository,
            OllamaService ollamaService) {

        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.ollamaService = ollamaService;
    }

    @Transactional(readOnly = true)
    public List<Project> getAllProjects(Long userId) {
        return projectRepository.findAllByUser_Id(userId);
    }

    @Transactional
    public Project saveProject(Project project, Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found."));

        validateProject(project);
        project.setUser(user);

        if (project.getGenerationId() == null
                || project.getGenerationId().isBlank()) {
            project.setGenerationId(UUID.randomUUID().toString());
        }

        if (project.getCreatedAt() == null) {
            project.setCreatedAt(LocalDateTime.now());
        }

        return projectRepository.save(project);
    }

    // Generate AI recommendations using individual resume analysis.
    // Career-comparison results are excluded.
    public List<Project> generateRecommendations(
            Long userId,
            String requestedJobRole) {

        if (requestedJobRole == null
                || requestedJobRole.isBlank()
                || requestedJobRole.trim().length() > 150) {

            throw new IllegalArgumentException(
                    "Please provide a valid job role.");
        }

        String jobRole = requestedJobRole.trim();

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found."));

        ResumeAnalysis savedAnalysis = resumeAnalysisRepository
                .findAllByUser_IdAndCareerComparisonFalseOrderByCreatedAtDesc(
                        userId)
                .stream()
                .filter(item ->
                        item.getJobRole() != null
                                && item.getJobRole().trim()
                                .equalsIgnoreCase(jobRole))
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Please analyze your resume for this job role first."));

        AnalysisResponse analysis;

        try {
            analysis = jsonMapper.readValue(
                    savedAnalysis.getResultJson(),
                    AnalysisResponse.class);

        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Unable to read the saved resume analysis.",
                    exception);
        }

        String prompt = buildPrompt(jobRole, analysis);

        String aiResponse = ollamaService.generate(
                prompt,
                PROJECTS_MAX_TOKENS);

        if (aiResponse == null || aiResponse.isBlank()) {
            throw new IllegalStateException(
                    "Ollama returned an empty project recommendation.");
        }

        JsonNode root = parseJson(aiResponse);
        JsonNode projectsNode = root.path("projects");

        if (!projectsNode.isArray() || projectsNode.size() != 3) {
            throw new IllegalStateException(
                    "AI did not return exactly 3 projects. Please try again.");
        }

        String generationId = UUID.randomUUID().toString();
        LocalDateTime createdAt = LocalDateTime.now();

        List<Project> generatedProjects = new ArrayList<>();

        for (JsonNode node : projectsNode) {

            Project project = new Project();

            project.setJobRole(jobRole);
            project.setTitle(readRequiredText(node, "title"));
            project.setDescription(
                    readRequiredText(node, "description"));

            project.setTechStack(
                    readStringList(
                            node.path("techStack"),
                            3,
                            8,
                            "tech stack"));

            project.setRequiredSkills(
                    readStringList(
                            node.path("requiredSkills"),
                            1,
                            10,
                            "required skills"));

            project.setMilestones(
                    readStringList(
                            node.path("milestones"),
                            3,
                            6,
                            "milestones"));

            String difficulty = readRequiredText(node, "difficulty")
                    .toLowerCase(Locale.ROOT);

            if (!List.of("beginner", "intermediate", "advanced")
                    .contains(difficulty)) {

                throw new IllegalStateException(
                        "AI returned an invalid project difficulty.");
            }

            project.setDifficulty(
                    difficulty.substring(0, 1).toUpperCase(Locale.ROOT)
                            + difficulty.substring(1));

            project.setDuration(readRequiredText(node, "duration"));

            project.setGenerationId(generationId);
            project.setCreatedAt(createdAt);
            project.setUser(user);

            generatedProjects.add(project);
        }

        // Save all three projects from the same generation.
        return projectRepository.saveAll(generatedProjects);
    }

    // Delete one project belonging to the logged-in user.
    @Transactional
    public void deleteProject(Long projectId, Long userId) {

        Project project = projectRepository
                .findByIdAndUser_Id(projectId, userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Project not found."));

        projectRepository.delete(project);
    }

    // Delete all projects belonging to one generation and user.
    @Transactional
    public void deleteGeneration(String generationId, Long userId) {

        if (generationId == null || generationId.isBlank()) {
            throw new IllegalArgumentException(
                    "Generation ID is required.");
        }

        List<Project> projects =
                projectRepository.findAllByGenerationIdAndUser_Id(
                        generationId,
                        userId);

        if (projects.isEmpty()) {
            throw new IllegalArgumentException(
                    "Project generation not found.");
        }

        projectRepository.deleteAll(projects);
    }

    private String buildPrompt(
            String jobRole,
            AnalysisResponse analysis) {

        String strengths = analysis.evidence() == null
                ? ""
                : analysis.evidence().stream()
                .map(AnalysisResponse.SkillEvidence::skill)
                .filter(skill ->
                        skill != null && !skill.isBlank())
                .limit(10)
                .collect(Collectors.joining(", "));

        String partialSkills = analysis.partial() == null
                ? ""
                : analysis.partial().stream()
                .sorted(Comparator.comparingInt(
                        item -> priorityRank(item.priority())))
                .map(AnalysisResponse.PartialSkill::skill)
                .filter(skill ->
                        skill != null && !skill.isBlank())
                .limit(MAX_SKILLS_IN_PROMPT)
                .collect(Collectors.joining(", "));

        String missingSkills = analysis.gaps() == null
                ? ""
                : analysis.gaps().stream()
                .sorted(Comparator.comparingInt(
                        item -> priorityRank(item.priority())))
                .map(AnalysisResponse.SkillGap::skill)
                .filter(skill ->
                        skill != null && !skill.isBlank())
                .limit(MAX_SKILLS_IN_PROMPT)
                .collect(Collectors.joining(", "));

        return """
                You are a practical student career-project recommender.

                TARGET ROLE: %s
                Resume match score: %s%%
                Strong skills: %s
                Partial skills: %s
                Missing skills: %s

                Create exactly 3 different, realistic student projects
                for this role. Focus on partial and missing skills while
                using the candidate's strong skills.

                RULES:
                1. Description explains the problem and outcome,
                   in at most 25 words.
                2. techStack contains 3 to 5 technologies.
                3. requiredSkills contains 2 to 5 skills.
                4. difficulty is Beginner, Intermediate or Advanced.
                5. duration is realistic, for example "2 weeks".
                6. milestones contains 3 to 5 items, each at most 8 words.
                7. Return only valid JSON, without Markdown.

                Return exactly this structure:
                {"projects":[{"title":"...","description":"...","techStack":["..."],"requiredSkills":["..."],"difficulty":"Beginner","duration":"2 weeks","milestones":["..."]}]}
                """.formatted(
                jobRole,
                analysis.score(),
                strengths.isBlank() ? "none identified" : strengths,
                partialSkills.isBlank() ? "none" : partialSkills,
                missingSkills.isBlank() ? "none" : missingSkills
        );
    }

    private int priorityRank(String priority) {

        if (priority == null) {
            return 3;
        }

        return switch (priority.toLowerCase(Locale.ROOT)) {
            case "high" -> 0;
            case "medium" -> 1;
            case "low" -> 2;
            default -> 3;
        };
    }

    private void validateProject(Project project) {

        if (project == null
                || project.getTitle() == null
                || project.getTitle().isBlank()) {

            throw new IllegalArgumentException(
                    "Project title is required.");
        }

        if (project.getTitle().length() > 200) {
            throw new IllegalArgumentException(
                    "Project title must be at most 200 characters.");
        }

        if (project.getDescription() != null
                && project.getDescription().length() > 2000) {

            throw new IllegalArgumentException(
                    "Project description is too long.");
        }

        if (project.getTechStack() == null
                || project.getRequiredSkills() == null
                || project.getMilestones() == null) {

            throw new IllegalArgumentException(
                    "Project lists must not be null.");
        }

        if (project.getTechStack().size() > 20
                || project.getRequiredSkills().size() > 20
                || project.getMilestones().size() > 20) {

            throw new IllegalArgumentException(
                    "Project lists contain too many items.");
        }
    }

    private String readRequiredText(
            JsonNode node,
            String field) {

        String value = node.path(field).asString("").trim();

        if (value.isBlank()) {
            throw new IllegalStateException(
                    "AI returned a project without " + field + ".");
        }

        return value;
    }

    private List<String> readStringList(
            JsonNode node,
            int minimum,
            int maximum,
            String fieldName) {

        if (!node.isArray()
                || node.size() < minimum
                || node.size() > maximum) {

            throw new IllegalStateException(
                    "AI returned an invalid " + fieldName + " list.");
        }

        List<String> values = new ArrayList<>();

        for (JsonNode item : node) {

            String value = item.asString("").trim();

            if (value.isBlank()) {
                throw new IllegalStateException(
                        "AI returned an empty item in "
                                + fieldName + ".");
            }

            values.add(value);
        }

        return values;
    }

    private JsonNode parseJson(String response) {

        try {
            String cleaned = response.trim();

            if (cleaned.startsWith("```json")) {
                cleaned = cleaned.substring(7).trim();

            } else if (cleaned.startsWith("```")) {
                cleaned = cleaned.substring(3).trim();
            }

            if (cleaned.endsWith("```")) {
                cleaned = cleaned.substring(
                        0,
                        cleaned.length() - 3).trim();
            }

            JsonNode root = jsonMapper.readTree(cleaned);

            if (root == null || !root.isObject()) {
                throw new IllegalStateException(
                        "AI returned invalid project JSON.");
            }

            return root;

        } catch (IllegalStateException exception) {
            throw exception;

        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Unable to parse AI project recommendations.",
                    exception);
        }
    }
}
