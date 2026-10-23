
package com.skillbridge.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record RoadmapResponse(
        Long id,
        String jobRole,
        LocalDateTime createdAt,
        List<TaskResponse> tasks
) {
    public record TaskResponse(
            Long id,
            int stepNumber,
            String title,
            String description,
            String duration,
            boolean completed
    ) {}
}
