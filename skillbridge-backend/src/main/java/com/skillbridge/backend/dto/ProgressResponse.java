
package com.skillbridge.backend.dto;

import java.util.List;

public record ProgressResponse(
        long completedTasks,
        long totalTasks,
        double completionPercentage,
        Double latestScore,
        Double previousScore,
        Double scoreChange,
        String jobRole,
        List<ScorePoint> scoreHistory
) {
    public record ScorePoint(
            double score,
            String jobRole,
            String date
    ) {}
}
