package com.skillbridge.backend.service;

import com.skillbridge.backend.dto.AnalysisResponse;
import com.skillbridge.backend.dto.RoadmapResponse;
import com.skillbridge.backend.entity.CareerRoadmap;
import com.skillbridge.backend.entity.RoadmapTask;
import com.skillbridge.backend.entity.ResumeAnalysis;
import com.skillbridge.backend.entity.User;
import com.skillbridge.backend.repository.CareerRoadmapRepository;
import com.skillbridge.backend.repository.ResumeAnalysisRepository;
import com.skillbridge.backend.repository.RoadmapTaskRepository;
import com.skillbridge.backend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class RoadmapService {

    private static final int MAX_STEPS = 5;

    // 4 tasks x ~70 tokens = ~300 tokens. 700 leaves a safe margin.
    private static final int ROADMAP_MAX_TOKENS = 700;

    // Only the most important skills are sent to the model.
    private static final int MAX_SKILLS_IN_PROMPT = 8;

    private final OllamaService ollamaService;
    private final CareerRoadmapRepository roadmapRepository;
    private final RoadmapTaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;

    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    public RoadmapService(
            OllamaService ollamaService,
            CareerRoadmapRepository roadmapRepository,
            RoadmapTaskRepository taskRepository,
            UserRepository userRepository,
            ResumeAnalysisRepository resumeAnalysisRepository
    ) {
        this.ollamaService = ollamaService;
        this.roadmapRepository = roadmapRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
    }

    /*
     * No @Transactional here on purpose: a transaction would keep a
     * database connection open during the whole LLM call.
     * roadmapRepository.save() runs in its own short transaction.
     */
    public RoadmapResponse generate(Long userId, String jobRole) {
        if (jobRole == null || jobRole.isBlank()) {
            throw new IllegalArgumentException(
                    "Please provide a target job role."
            );
        }

        jobRole = jobRole.trim();

        if (jobRole.length() > 150) {
            throw new IllegalArgumentException(
                    "Job role cannot exceed 150 characters."
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found.")
                );

        AnalysisResponse analysis = getMatchingAnalysis(userId, jobRole);

        List<AiTask> aiTasks = generateWithOllama(jobRole, analysis);

        CareerRoadmap roadmap = new CareerRoadmap();
        roadmap.setUser(user);
        roadmap.setJobRole(jobRole);

        int stepNumber = 1;

        for (AiTask aiTask : aiTasks) {
            RoadmapTask task = new RoadmapTask();

            task.setStepNumber(stepNumber++);
            task.setTitle(aiTask.title().trim());
            task.setDescription(aiTask.description().trim());
            task.setDuration(aiTask.duration().trim());
            task.setCompleted(false);

            roadmap.addTask(task);
        }

        return toResponse(roadmapRepository.save(roadmap));
    }

    private List<AiTask> generateWithOllama(
            String jobRole,
            AnalysisResponse analysis
    ) {
        try {
            String prompt = """
                    You are a career-roadmap planner for students.

                    TARGET ROLE: %s

                    CANDIDATE PROFILE:
                    %s

                    RULES:
                    1. Create exactly 4 tasks in a sensible learning order.
                    2. Cover High-priority missing and partial skills first.
                    3. "title" is specific and at most 8 words.
                    4. "description" states one concrete deliverable and how
                       to know it is finished, in at most 30 words.
                    5. "duration" is realistic, for example "1 week".
                    6. Do not invent experience the candidate does not have.
                    7. Return only JSON, without Markdown.

                    Return exactly this structure:
                    {"tasks":[{"title":"...","description":"...","duration":"..."}]}
                    """.formatted(jobRole, buildSkillSummary(analysis));

            String aiResponse =
                    ollamaService.generate(prompt, ROADMAP_MAX_TOKENS);

            if (aiResponse == null || aiResponse.isBlank()) {
                throw new IllegalStateException(
                        "Ollama returned an empty roadmap."
                );
            }

            JsonNode root = parseJsonResponse(aiResponse);
            JsonNode tasksNode = root.get("tasks");

            if (tasksNode == null || !tasksNode.isArray()) {
                throw new IllegalStateException(
                        "Ollama response does not contain a tasks array."
                );
            }

            List<AiTask> tasks = new ArrayList<>();

            for (JsonNode node : tasksNode) {
                if (tasks.size() >= MAX_STEPS) {
                    break;
                }

                String title = textValue(node, "title");
                String description = textValue(node, "description");
                String duration = textValue(node, "duration");

                if (title.isBlank()
                        || description.isBlank()
                        || duration.isBlank()) {
                    continue;
                }

                tasks.add(new AiTask(title, description, duration));
            }

            if (tasks.isEmpty()) {
                throw new IllegalStateException(
                        "Ollama did not generate any valid roadmap tasks."
                );
            }

            return tasks;

        } catch (IllegalStateException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Could not generate the roadmap with Ollama. "
                            + "Check that Ollama is running, the model is "
                            + "available, and its response is valid JSON.",
                    exception
            );
        }
    }

    /*
     * Compact summary instead of the full analysis JSON.
     * Matched skills only need their names; the long evidence quotes
     * are not useful for planning and just slow down the model.
     */
    private String buildSkillSummary(AnalysisResponse analysis) {
        StringBuilder summary = new StringBuilder();

        summary.append("Strong skills: ");

        if (analysis.evidence() == null || analysis.evidence().isEmpty()) {
            summary.append("none identified");
        } else {
            summary.append(String.join(", ",
                    analysis.evidence().stream()
                            .map(AnalysisResponse.SkillEvidence::skill)
                            .limit(10)
                            .toList()));
        }

        summary.append("\n\nPartial skills (need strengthening):\n");

        List<AnalysisResponse.PartialSkill> partial =
                analysis.partial() == null
                        ? List.of()
                        : analysis.partial().stream()
                        .sorted(Comparator.comparingInt(
                                item -> priorityRank(item.priority())))
                        .limit(MAX_SKILLS_IN_PROMPT)
                        .toList();

        if (partial.isEmpty()) {
            summary.append("- none\n");
        }

        for (AnalysisResponse.PartialSkill item : partial) {
            summary.append("- ")
                    .append(item.skill())
                    .append(" [").append(item.priority()).append("]: ")
                    .append(item.suggestion())
                    .append("\n");
        }

        summary.append("\nMissing skills:\n");

        List<AnalysisResponse.SkillGap> gaps =
                analysis.gaps() == null
                        ? List.of()
                        : analysis.gaps().stream()
                        .sorted(Comparator.comparingInt(
                                item -> priorityRank(item.priority())))
                        .limit(MAX_SKILLS_IN_PROMPT)
                        .toList();

        if (gaps.isEmpty()) {
            summary.append("- none (create advanced tasks for this role)\n");
        }

        for (AnalysisResponse.SkillGap item : gaps) {
            summary.append("- ")
                    .append(item.skill())
                    .append(" [").append(item.priority()).append("]: ")
                    .append(item.suggestion())
                    .append("\n");
        }

        return summary.toString();
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

    private JsonNode parseJsonResponse(String response) {
        String content = response.trim();

        // Also tolerate a model response surrounded by Markdown fences.
        if (content.startsWith("```")) {
            content = content.replaceFirst("^```(?:json)?\\s*", "");
            content = content.replaceFirst("\\s*```\\s*$", "");
        }

        int start = content.indexOf('{');
        int end = content.lastIndexOf('}');

        if (start < 0 || end <= start) {
            throw new IllegalStateException(
                    "Ollama did not return a JSON object."
            );
        }

        return jsonMapper.readTree(content.substring(start, end + 1));
    }

    private String textValue(JsonNode node, String field) {
        JsonNode value = node.get(field);

        if (value == null || value.isNull() || !value.isString()) {
            return "";
        }

        return value.asString().trim();
    }

    private AnalysisResponse getMatchingAnalysis(
            Long userId,
            String jobRole
    ) {
        ResumeAnalysis saved = resumeAnalysisRepository
                .findAllByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(item -> item.getJobRole() != null
                        && item.getJobRole().trim()
                        .equalsIgnoreCase(jobRole))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Please analyze your resume for this job role "
                                + "before generating a personalized roadmap."
                ));

        try {
            return jsonMapper.readValue(
                    saved.getResultJson(),
                    AnalysisResponse.class
            );
        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Could not read the saved resume analysis.",
                    exception
            );
        }
    }

    private record AiTask(
            String title,
            String description,
            String duration
    ) {}

    @Transactional(readOnly = true)
    public RoadmapResponse getLatest(Long userId) {
        return roadmapRepository
                .findFirstByUser_IdOrderByCreatedAtDesc(userId)
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<RoadmapResponse> getHistory(Long userId) {
        return roadmapRepository
                .findAllByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RoadmapResponse getById(Long userId, Long roadmapId) {
        CareerRoadmap roadmap = roadmapRepository
                .findByIdAndUser_Id(roadmapId, userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Roadmap not found.")
                );

        return toResponse(roadmap);
    }

    @Transactional
    public void deleteRoadmap(Long userId, Long roadmapId) {
        CareerRoadmap roadmap = roadmapRepository
                .findByIdAndUser_Id(roadmapId, userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Roadmap not found.")
                );

        roadmapRepository.delete(roadmap);
    }

    @Transactional
    public RoadmapResponse updateTask(
            Long userId,
            Long taskId,
            boolean completed
    ) {
        RoadmapTask task = taskRepository
                .findByIdAndRoadmap_User_Id(taskId, userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Task not found.")
                );

        task.setCompleted(completed);
        taskRepository.save(task);

        return toResponse(task.getRoadmap());
    }

    private RoadmapResponse toResponse(CareerRoadmap roadmap) {
        List<RoadmapResponse.TaskResponse> tasks = new ArrayList<>();

        for (RoadmapTask task : roadmap.getTasks()) {
            tasks.add(new RoadmapResponse.TaskResponse(
                    task.getId(),
                    task.getStepNumber(),
                    task.getTitle(),
                    task.getDescription(),
                    task.getDuration(),
                    task.isCompleted()
            ));
        }

        return new RoadmapResponse(
                roadmap.getId(),
                roadmap.getJobRole(),
                roadmap.getCreatedAt(),
                tasks
        );
    }
}