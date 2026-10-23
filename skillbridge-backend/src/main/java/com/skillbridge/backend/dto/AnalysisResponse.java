
package com.skillbridge.backend.dto;

import java.util.List;

public record AnalysisResponse(
        double score,
        List<SkillEvidence> evidence,
        List<PartialSkill> partial,
        List<SkillGap> gaps
) {
    public record SkillEvidence(
            String skill,
            String evidence
    ) {}

    public record PartialSkill(
            String skill,
            String evidence,
            String priority,
            String suggestion
    ) {}

    public record SkillGap(
            String skill,
            String priority,
            String suggestion
    ) {}
}
